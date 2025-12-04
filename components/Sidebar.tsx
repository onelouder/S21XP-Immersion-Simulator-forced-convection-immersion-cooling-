
import React from 'react';
import { Settings, Droplets, Thermometer, Zap } from 'lucide-react';
import { FluidProperties, HeatSinkGeometry, OperatingConditions } from '../types';
import { AVAILABLE_FLUIDS } from '../constants';

interface SidebarProps {
  fluids: string[];
  setFluids: (ids: string[]) => void;
  geometry: HeatSinkGeometry;
  setGeometry: (g: HeatSinkGeometry) => void;
  conditions: OperatingConditions;
  setConditions: (c: OperatingConditions) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  fluids,
  setFluids,
  geometry,
  setGeometry,
  conditions,
  setConditions,
}) => {
  const toggleFluid = (id: string) => {
    if (fluids.includes(id)) {
      setFluids(fluids.filter((f) => f !== id));
    } else {
      setFluids([...fluids, id]);
    }
  };

  const handleGeoChange = (key: keyof HeatSinkGeometry, value: string) => {
    setGeometry({ ...geometry, [key]: parseFloat(value) || 0 });
  };

  const handleCondChange = (key: keyof OperatingConditions, value: string) => {
    setConditions({ ...conditions, [key]: parseFloat(value) || 0 });
  };

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-700 h-full overflow-y-auto p-4 flex flex-col gap-6 text-sm">
      <div className="flex items-center gap-2 text-blue-400 font-bold text-lg mb-2">
        <Zap className="w-5 h-5" />
        <span>Sim Config</span>
      </div>

      {/* Fluids */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-700 pb-2">
          <Droplets className="w-4 h-4" />
          <span>Fluids</span>
        </div>
        <div className="space-y-2">
          {AVAILABLE_FLUIDS.map((fluid) => (
            <div
              key={fluid.id}
              className="flex items-center justify-between group cursor-pointer"
              onClick={() => toggleFluid(fluid.id)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    fluids.includes(fluid.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-500 group-hover:border-slate-400'
                  }`}
                >
                  {fluids.includes(fluid.id) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className={`text-slate-300 ${fluids.includes(fluid.id) ? 'font-medium' : ''}`}>
                  {fluid.name}
                </span>
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: fluid.color }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Geometry */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-700 pb-2">
          <Settings className="w-4 h-4" />
          <span>Heat Sink Geometry</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
            {[
                { label: 'Length (L)', key: 'length', unit: 'm' },
                { label: 'Width (W)', key: 'width', unit: 'm' },
                { label: 'Fin Spacing (s)', key: 'finSpacing', unit: 'm' },
                { label: 'Fin Height (H_fin)', key: 'finHeight', unit: 'm' },
            ].map((field) => (
                 <div key={field.key}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{field.label}</span>
                        <span>{field.unit}</span>
                    </div>
                    <input
                        type="number"
                        step="0.001"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                        value={geometry[field.key as keyof HeatSinkGeometry]}
                        onChange={(e) => handleGeoChange(field.key as keyof HeatSinkGeometry, e.target.value)}
                    />
                </div>
            ))}
        </div>
      </div>

      {/* Operating Conditions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold border-b border-slate-700 pb-2">
            <Thermometer className="w-4 h-4" />
            <span>Operating Conditions</span>
        </div>
        <div className="space-y-3">
            <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Junction Temp (Max)</span>
                    <span>°C</span>
                </div>
                <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.junctionTemp}
                    onChange={(e) => handleCondChange('junctionTemp', e.target.value)}
                />
            </div>
            <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Inlet Temp (T_inlet)</span>
                    <span>°C</span>
                </div>
                <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.inletTemp}
                    onChange={(e) => handleCondChange('inletTemp', e.target.value)}
                />
            </div>
             <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Target Power (Ref)</span>
                    <span>W</span>
                </div>
                <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.maxPowerTarget}
                    onChange={(e) => handleCondChange('maxPowerTarget', e.target.value)}
                />
            </div>
             <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Target Hashrate (Ref)</span>
                    <span>TH/s</span>
                </div>
                <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.targetHashrate}
                    onChange={(e) => handleCondChange('targetHashrate', e.target.value)}
                />
            </div>
            <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Hash Efficiency</span>
                    <span>J/TH</span>
                </div>
                <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="30"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.hashEfficiency}
                    onChange={(e) => handleCondChange('hashEfficiency', e.target.value)}
                />
            </div>
        </div>
      </div>
      
      <div className="mt-auto text-xs text-slate-500">
        <p>* Assumes laminar flow (Re &lt; 2300).</p>
        <p>* Properties constant at 40°C.</p>
      </div>
    </div>
  );
};

export default Sidebar;
