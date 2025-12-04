
import React, { useState } from 'react';
import { OperatingConditions, SimulationResult } from '../types';
import ChartPanel from './ChartPanel';
import { Calculator, Users, Coins, TrendingUp, Gauge, DollarSign } from 'lucide-react';

interface FinancialCalculatorProps {
  conditions: OperatingConditions;
  setConditions: (c: OperatingConditions) => void;
  results: SimulationResult;
}

const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  conditions,
  setConditions,
  results,
}) => {
  const [hoveredVelocity, setHoveredVelocity] = useState<number | null>(null);

  const handleChange = (key: keyof OperatingConditions, value: string) => {
    const val = parseFloat(value);
    if (val < 0) return;
    setConditions({ ...conditions, [key]: isNaN(val) ? 0 : val });
  };

  const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Calculate Nominal Fleet Power (MW) based on calculated miner count
  // This essentially verifies the math: Miners * Target Power ~ Facility Power
  const minerCount = results.calculatedMinerCount;
  
  // Logic for Active Velocity: Default to 0.05 m/s if not hovering
  const activeVelocity = hoveredVelocity !== null ? hoveredVelocity : 0.05;

  // Find data points for the active velocity
  // Note: Using a small epsilon for float comparison safety.
  const powerPoint = results.powerData.find(p => Math.abs(p.velocity - activeVelocity) < 0.0001);
  const revenuePoint = results.revenueData.find(p => Math.abs(p.velocity - activeVelocity) < 0.0001);

  // Calculate Baseline (Lowest) and Highest Revenue for visual comparisons
  let minRevenue = Number.MAX_VALUE;
  let maxRevenue = Number.MIN_VALUE;

  if (revenuePoint) {
      results.fluids.forEach(f => {
          const r = revenuePoint[f.id] || 0;
          if (r < minRevenue) minRevenue = r;
          if (r > maxRevenue) maxRevenue = r;
      });
  }
  // Safety check if no data is found
  if (minRevenue === Number.MAX_VALUE) minRevenue = 0;
  if (maxRevenue === Number.MIN_VALUE) maxRevenue = 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
        <div className="p-2 bg-green-600/20 text-green-400 rounded-lg">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Financial Calculator</h2>
          <p className="text-slate-400 text-sm">Projected daily revenue based on Facility Power Capacity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Sections */}
        <div className="space-y-6">
          
          {/* Fleet Configuration */}
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
            <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-400" /> Facility Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Total Power Capacity</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    value={conditions.totalFacilityPowerMW}
                    onChange={(e) => handleChange('totalFacilityPowerMW', e.target.value)}
                    onKeyDown={preventNegative}
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-600">MW</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                 <span className="text-xs text-slate-400">Calculated Fleet Size</span>
                 <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-mono text-slate-200">{minerCount} miners</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Economic Analysis Table */}
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-300 font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" /> Economic Analysis
                </h3>
                <span className="text-[10px] text-slate-500 uppercase bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    @ {activeVelocity.toFixed(3)} m/s
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                            <th className="pb-2 pl-1 font-medium">Fluid</th>
                            <th className="pb-2 text-right font-medium">Total Power (MW)</th>
                            <th className="pb-2 text-right font-medium">Daily Rev</th>
                            <th className="pb-2 text-right font-medium">Delta Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {results.fluids.map(fluid => {
                            // Get single miner power at active velocity
                            const powerPerMiner = powerPoint ? (powerPoint[fluid.id] || 0) : 0;
                            // Scale to fleet size (convert W to MW)
                            const totalFleetPowerMW = (powerPerMiner * minerCount) / 1000000;
                            
                            const totalRevenue = revenuePoint ? (revenuePoint[fluid.id] || 0) : 0;
                            const delta = totalRevenue - minRevenue;
                            
                            // Check if exceeding capacity for visual warning
                            const isOverCapacity = totalFleetPowerMW > conditions.totalFacilityPowerMW;

                            // Check if this is the highest revenue row (winner)
                            const isHighest = totalRevenue === maxRevenue && maxRevenue > 0;

                            return (
                                <tr 
                                  key={fluid.id} 
                                  className={`group transition-all duration-200 ${
                                    isHighest 
                                      ? 'bg-emerald-900/20 ring-1 ring-emerald-500/30' 
                                      : 'hover:bg-white/5'
                                  }`}
                                >
                                    <td className="py-2 pl-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fluid.color }} />
                                            <span className={`text-slate-300 font-medium ${isHighest ? 'text-white' : ''}`}>
                                              {fluid.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`py-2 text-right font-mono ${isOverCapacity ? 'text-red-400' : 'text-slate-300'}`}>
                                        {totalFleetPowerMW.toFixed(2)}
                                    </td>
                                    <td className={`py-2 text-right font-mono ${isHighest ? 'text-emerald-300 font-bold' : 'text-green-400'}`}>
                                        ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className={`py-2 pr-2 text-right font-mono font-bold ${delta > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                        {delta === 0 ? '-' : `+$${delta.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!powerPoint && (
                   <div className="text-center py-4 text-slate-500 italic">No data available for this velocity.</div>
                )}
            </div>
          </div>

          {/* Market Parameters */}
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
            <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" /> Market Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Bitcoin Price (Current)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-900 border border-slate-700 rounded pl-6 pr-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500 transition-colors"
                    value={conditions.bitcoinPrice}
                    onChange={(e) => handleChange('bitcoinPrice', e.target.value)}
                    onKeyDown={preventNegative}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reward per TH/s</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    className="w-full bg-slate-900 border border-slate-700 rounded pl-6 pr-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500 transition-colors"
                    value={conditions.rewardPerTh}
                    onChange={(e) => handleChange('rewardPerTh', e.target.value)}
                    onKeyDown={preventNegative}
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-600">/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chart Section */}
        <div className="flex flex-col h-full">
            <div className="flex-1">
                <ChartPanel
                    title="Total Revenue per Day vs. Velocity"
                    yLabel="Revenue (USD/day)"
                    data={results.revenueData}
                    fluids={results.fluids}
                    onHover={setHoveredVelocity}
                />
            </div>
             <div className="mt-4 p-4 bg-blue-900/10 border border-blue-900/30 rounded-lg text-xs text-blue-300">
                <p className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Revenue scales linearly with Hashrate. Increasing flow velocity improves cooling, allowing higher sustained hashrates and thus higher daily revenue. Hover over the chart to see economic details for a specific velocity.</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialCalculator;
