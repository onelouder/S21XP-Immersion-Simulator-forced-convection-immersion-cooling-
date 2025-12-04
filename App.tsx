
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChartPanel from './components/ChartPanel';
import FinancialCalculator from './components/FinancialCalculator';
import { DEFAULT_GEOMETRY, DEFAULT_CONDITIONS } from './constants';
import { runSimulation } from './simulation';
import { HeatSinkGeometry, OperatingConditions } from './types';
import { LayoutDashboard } from 'lucide-react';

// Jason Wells: Main Application Component
// Orchestrates the data flow: User Inputs -> Simulation Engine -> Results -> Charts.
const App: React.FC = () => {
  const [fluids, setFluids] = useState<string[]>(['dcf281', 'novel_mpao', 'castrol_dc15']);
  const [geometry, setGeometry] = useState<HeatSinkGeometry>(DEFAULT_GEOMETRY);
  const [conditions, setConditions] = useState<OperatingConditions>(DEFAULT_CONDITIONS);

  // Jason Wells: Reactive Simulation
  // The runSimulation function is pure deterministic logic based on the inputs.
  // Using useMemo ensures we only re-crunch numbers when physics parameters change.
  const results = useMemo(() => {
    return runSimulation(fluids, geometry, conditions);
  }, [fluids, geometry, conditions]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* Sidebar - Controls for Geometry, Fluids, and Operating Conditions */}
      <Sidebar
        fluids={fluids}
        setFluids={setFluids}
        geometry={geometry}
        setGeometry={setGeometry}
        conditions={conditions}
        setConditions={setConditions}
      />

      {/* Main Content - Visualization Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-lg">
                <LayoutDashboard className="text-white w-5 h-5" />
             </div>
             <div>
                <h1 className="text-slate-100 font-bold text-lg leading-tight">Antminer S21 XP Immersion Analysis</h1>
                <p className="text-slate-500 text-xs">Forced Convection Analytical Model (Standard Laminar)</p>
             </div>
           </div>
        </header>

        <main className="p-6 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartPanel
              title="Total Power Dissipation (Q_total) vs. Velocity"
              yLabel="Power (W)"
              data={results.powerData}
              fluids={results.fluids}
              targetLine={conditions.maxPowerTarget}
            />
            
            <ChartPanel
              title="Total Hashrate (H_total) vs. Velocity"
              yLabel="Hashrate (TH/s)"
              data={results.hashrateData}
              fluids={results.fluids}
              targetLine={conditions.targetHashrate}
            />

            <ChartPanel
              title="Outlet Temperature vs. Velocity"
              yLabel="Outlet Temp (°C)"
              data={results.outletTempData}
              fluids={results.fluids}
            />

            <div className="col-span-1 bg-slate-900/50 border border-slate-800 rounded-lg p-6 flex flex-col justify-center">
                <h3 className="text-slate-200 font-semibold mb-4">Simulation Summary</h3>
                <div className="text-sm text-slate-400 space-y-2">
                  <p>This model simulates the thermal performance based on the <strong className="text-slate-300">Analytical Solution Procedure</strong>.</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 ml-5 list-disc">
                      <li>Flow Regime: Standard Laminar (Parallel Plate Heat Sink)</li>
                      <li>Max Junction Temp: <span className="text-blue-400">{conditions.junctionTemp}°C</span></li>
                      <li>Inlet Temp: <span className="text-blue-400">{conditions.inletTemp}°C</span></li>
                      <li>Chip Thermal Resistance: <span className="text-blue-400">1.48 K/W</span> (Junction to Heatsink)</li>
                      <li>Hash Efficiency: <span className="text-blue-400">{conditions.hashEfficiency} J/TH</span></li>
                  </ul>
                  <p className="mt-4 pt-4 border-t border-slate-700">
                      The charts demonstrate how increased flow velocity reduces thermal resistance. However, performance is ultimately limited by the fixed internal resistance of the chips, causing the power and hashrate curves to plateau at high velocities.
                  </p>
                </div>
            </div>
          </div>

          <FinancialCalculator 
            conditions={conditions}
            setConditions={setConditions}
            results={results}
          />

        </main>
      </div>
    </div>
  );
};

export default App;
