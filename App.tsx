
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChartPanel from './components/ChartPanel';
import FinancialCalculator from './components/FinancialCalculator';
import EquationsModal from './components/EquationsModal';
import { DEFAULT_GEOMETRY, DEFAULT_CONDITIONS, AVAILABLE_FLUIDS } from './constants';
import { runSimulation } from './simulation';
import { HeatSinkGeometry, OperatingConditions, FluidProperties } from './types';
import { LayoutDashboard, BookOpen, Activity, Cpu, Server, Zap } from 'lucide-react';

// Jason Wells: Main Application Component
// Orchestrates the data flow: User Inputs -> Simulation Engine -> Results -> Charts.
const App: React.FC = () => {
  // State for Fluid Definitons (allows editing properties)
  const [fluidSpecs, setFluidSpecs] = useState<FluidProperties[]>(AVAILABLE_FLUIDS);
  // State for Selected Fluids (by ID)
  const [selectedFluidIds, setSelectedFluidIds] = useState<string[]>(['dcf281', 'novel_mpao', 'castrol_dc15']);
  
  const [geometry, setGeometry] = useState<HeatSinkGeometry>(DEFAULT_GEOMETRY);
  const [conditions, setConditions] = useState<OperatingConditions>(DEFAULT_CONDITIONS);
  const [showEquations, setShowEquations] = useState(false);
  const [hoveredVelocity, setHoveredVelocity] = useState<number | null>(null);

  // Jason Wells: Reactive Simulation
  // We capture performance metrics here to give the user feedback on computational cost.
  const { results, perfMetrics } = useMemo(() => {
    const start = performance.now();
    // Pass the full fluidSpecs array so user edits are reflected in sim
    const res = runSimulation(fluidSpecs, selectedFluidIds, geometry, conditions);
    const end = performance.now();

    const count = res.powerData.length * res.fluids.length;
    
    return {
      results: res,
      perfMetrics: {
        time: (end - start).toFixed(2),
        dataPoints: count
      }
    };
  }, [fluidSpecs, selectedFluidIds, geometry, conditions]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* Sidebar - Controls for Geometry, Fluids, and Operating Conditions */}
      <Sidebar
        allFluids={fluidSpecs}
        setAllFluids={setFluidSpecs}
        selectedFluids={selectedFluidIds}
        setSelectedFluids={setSelectedFluidIds}
        geometry={geometry}
        setGeometry={setGeometry}
        conditions={conditions}
        setConditions={setConditions}
      />

      {/* Main Content - Visualization Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/50">
                <LayoutDashboard className="text-white w-5 h-5" />
             </div>
             <div>
                <h1 className="text-slate-100 font-bold text-lg leading-tight">Antminer S21 XP Immersion Analysis</h1>
                <p className="text-slate-500 text-xs">Forced Convection Analytical Model (Standard Laminar)</p>
             </div>
           </div>
           
           <button 
             onClick={() => setShowEquations(true)}
             className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors border border-slate-700 shadow-sm"
           >
             <BookOpen className="w-4 h-4" />
             <span className="hidden sm:inline">Governing Equations</span>
           </button>
        </header>

        <main className="p-6 pb-20">
          {/* Specs and Assumptions Summary - Enhanced Visibility */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 mb-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm shadow-lg ring-1 ring-white/5">
             <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-950 rounded-lg text-blue-400 border border-slate-800">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                   <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold mb-0.5">System Spec</span>
                   <span className="text-slate-100 font-semibold block">Antminer S21 XP Immersion</span>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-950 rounded-lg text-blue-400 border border-slate-800">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                   <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold mb-0.5">ASIC Config</span>
                   <span className="text-slate-100 font-semibold block">273 x BM1370 Chips</span>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-950 rounded-lg text-blue-400 border border-slate-800">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                   <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold mb-0.5">Rated Output</span>
                   <span className="text-slate-100 font-semibold block">300 TH/s @ 5700 W</span>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-950 rounded-lg text-blue-400 border border-slate-800">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                   <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold mb-0.5">Model Assumption</span>
                   <span className="text-slate-100 font-semibold block">Standard Laminar Flow</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartPanel
              title="Total Power Dissipation (Q_total) vs. Velocity"
              yLabel="Power (W)"
              data={results.powerData}
              fluids={results.fluids}
              targetLine={conditions.maxPowerTarget}
              onHover={setHoveredVelocity}
            />
            
            <ChartPanel
              title="Total Hashrate (H_total) vs. Velocity"
              yLabel="Hashrate (TH/s)"
              data={results.hashrateData}
              fluids={results.fluids}
              targetLine={conditions.targetHashrate}
              onHover={setHoveredVelocity}
            />

            <ChartPanel
              title="Outlet Temperature vs. Velocity"
              yLabel="Outlet Temp (°C)"
              data={results.outletTempData}
              fluids={results.fluids}
              onHover={setHoveredVelocity}
            />

            <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-lg p-6 flex flex-col h-[400px]">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-slate-200 font-semibold mb-4">Simulation Summary</h3>
                  <div className="text-sm text-slate-400 space-y-3">
                    <p>This model simulates the thermal performance based on the <strong className="text-slate-300">Analytical Solution Procedure</strong>.</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 ml-5 list-disc text-xs sm:text-sm">
                        <li>Flow Regime: Standard Laminar (Parallel Plate)</li>
                        <li>Max Junction Temp: <span className="text-blue-400 font-mono">{conditions.junctionTemp}°C</span></li>
                        <li>Inlet Temp: <span className="text-blue-400 font-mono">{conditions.inletTemp}°C</span></li>
                        <li>Chip Thermal Resistance: <span className="text-blue-400 font-mono">1.48 K/W</span> (Junction to Heatsink)</li>
                        <li>Hash Efficiency: <span className="text-blue-400 font-mono">{conditions.hashEfficiency} J/TH</span></li>
                    </ul>
                    <p className="mt-4 pt-4 border-t border-slate-700">
                        The charts demonstrate how increased flow velocity reduces thermal resistance. However, performance is ultimately limited by the fixed internal resistance of the chips, causing the power and hashrate curves to plateau at high velocities.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-4 text-xs font-mono text-slate-500 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-emerald-500" />
                    <span>Calc Time: <span className="text-slate-300">{perfMetrics.time}ms</span></span>
                  </div>
                  <div className="w-px h-3 bg-slate-700"></div>
                  <div>
                    <span>Data Points: <span className="text-slate-300">{perfMetrics.dataPoints}</span></span>
                  </div>
                </div>
            </div>
          </div>

          <FinancialCalculator 
            conditions={conditions}
            setConditions={setConditions}
            results={results}
          />

          <EquationsModal 
            isOpen={showEquations} 
            onClose={() => setShowEquations(false)} 
          />
        </main>
      </div>
    </div>
  );
};

export default App;
