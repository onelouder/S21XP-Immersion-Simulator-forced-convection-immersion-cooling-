
import React, { useState } from 'react';
import { Settings, Droplets, Thermometer, Zap, Edit2, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { FluidProperties, HeatSinkGeometry, OperatingConditions } from '../types';

interface SidebarProps {
  allFluids: FluidProperties[];
  setAllFluids: (fluids: FluidProperties[]) => void;
  selectedFluids: string[];
  setSelectedFluids: (ids: string[]) => void;
  geometry: HeatSinkGeometry;
  setGeometry: (g: HeatSinkGeometry) => void;
  conditions: OperatingConditions;
  setConditions: (c: OperatingConditions) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  allFluids,
  setAllFluids,
  selectedFluids,
  setSelectedFluids,
  geometry,
  setGeometry,
  conditions,
  setConditions,
}) => {
  const [editingFluidId, setEditingFluidId] = useState<string | null>(null);

  const toggleFluid = (id: string) => {
    if (selectedFluids.includes(id)) {
      setSelectedFluids(selectedFluids.filter((f) => f !== id));
    } else {
      setSelectedFluids([...selectedFluids, id]);
    }
  };

  // Create a new fluid with default values
  const handleAddFluid = () => {
    const newId = `custom_${Date.now()}`;
    const newFluid: FluidProperties = {
      id: newId,
      name: 'New Custom Fluid',
      density: 800,
      kinematicViscosity: 5.0,
      dynamicViscosity: 0.004,
      specificHeat: 2000,
      thermalConductivity: 0.14,
      prandtl: 80,
      color: '#ffffff' // Default white, user can change
    };
    setAllFluids([...allFluids, newFluid]);
    setSelectedFluids([...selectedFluids, newId]); // Auto-select
    setEditingFluidId(newId); // Auto-open edit panel
  };

  const handleDeleteFluid = (id: string) => {
    // Prevent deleting the last fluid to avoid empty state issues
    if (allFluids.length <= 1) return;
    setAllFluids(allFluids.filter(f => f.id !== id));
    setSelectedFluids(selectedFluids.filter(fid => fid !== id));
  };

  const handleGeoChange = (key: keyof HeatSinkGeometry, value: string) => {
    const val = parseFloat(value);
    if (val < 0) return;
    setGeometry({ ...geometry, [key]: isNaN(val) ? 0 : val });
  };

  const handleCondChange = (key: keyof OperatingConditions, value: string) => {
    const val = parseFloat(value);
    if (val < 0) return;
    setConditions({ ...conditions, [key]: isNaN(val) ? 0 : val });
  };

  // Jason Wells: Updated handler to support both Number and String (Name/Color) updates
  const handleFluidPropChange = (id: string, key: keyof FluidProperties, value: string) => {
    let finalValue: string | number = value;

    // Check if the key corresponds to a numeric field
    const numericFields = ['density', 'kinematicViscosity', 'dynamicViscosity', 'specificHeat', 'thermalConductivity', 'prandtl'];
    
    if (numericFields.includes(key as string)) {
      const numVal = parseFloat(value);
      if (numVal < 0) return; // Prevent negative values
      finalValue = isNaN(numVal) ? 0 : numVal;
    }

    const updatedFluids = allFluids.map(f => {
      if (f.id === id) {
        return { ...f, [key]: finalValue };
      }
      return f;
    });
    setAllFluids(updatedFluids);
  };

  const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-700 h-full overflow-y-auto p-4 flex flex-col gap-6 text-sm">
      <div className="flex items-center gap-2 text-blue-400 font-bold text-lg mb-2">
        <Zap className="w-5 h-5" />
        <span>Sim Config</span>
      </div>

      {/* Fluids */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2">
             <Droplets className="w-4 h-4" />
             <span>Fluids</span>
          </div>
          <button 
            onClick={handleAddFluid}
            className="p-1 hover:bg-slate-800 rounded text-blue-400 hover:text-blue-300 transition-colors"
            title="Add Custom Fluid"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {allFluids.map((fluid) => (
            <div key={fluid.id} className="flex flex-col bg-slate-950/50 rounded border border-slate-800">
              <div className="flex items-center justify-between p-2">
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden"
                  onClick={() => toggleFluid(fluid.id)}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      selectedFluids.includes(fluid.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {selectedFluids.includes(fluid.id) && (
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
                  <span className={`text-slate-300 truncate ${selectedFluids.includes(fluid.id) ? 'font-medium' : ''}`}>
                    {fluid.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                    <div
                        className="w-2 h-2 rounded-full mr-1 shrink-0"
                        style={{ backgroundColor: fluid.color }}
                    />
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingFluidId(editingFluidId === fluid.id ? null : fluid.id);
                        }}
                        className={`p-1 rounded hover:bg-slate-700 transition-colors ${editingFluidId === fluid.id ? 'text-blue-400 bg-slate-800' : 'text-slate-500'}`}
                        title="Edit Properties"
                    >
                        {editingFluidId === fluid.id ? <ChevronUp className="w-3 h-3"/> : <Edit2 className="w-3 h-3"/>}
                    </button>
                    <button
                        onClick={(e) => {
                             e.stopPropagation();
                             handleDeleteFluid(fluid.id);
                        }}
                        className="p-1 rounded hover:bg-red-900/30 text-slate-600 hover:text-red-400 transition-colors"
                        title="Delete Fluid"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
              </div>

              {/* Editable Properties Panel */}
              {editingFluidId === fluid.id && (
                  <div className="p-3 border-t border-slate-800 bg-slate-900/30 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0">Fluid Definition</p>
                      
                      {/* Name and Color */}
                      <div className="grid grid-cols-1 gap-2">
                          <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Name</span>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                                value={fluid.name}
                                onChange={(e) => handleFluidPropChange(fluid.id, 'name', e.target.value)}
                            />
                          </div>
                           <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Chart Color</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="h-6 w-8 bg-transparent border-0 p-0 cursor-pointer"
                                    value={fluid.color}
                                    onChange={(e) => handleFluidPropChange(fluid.id, 'color', e.target.value)}
                                />
                                <input 
                                    type="text"
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 uppercase"
                                    value={fluid.color}
                                    onChange={(e) => handleFluidPropChange(fluid.id, 'color', e.target.value)}
                                />
                            </div>
                          </div>
                      </div>

                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-2 mb-0">Physical Properties @ 40°C</p>

                      <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Density (ρ)</span>
                              <span>kg/m³</span>
                          </div>
                          <input
                              type="number"
                              min="0"
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              value={fluid.density}
                              onChange={(e) => handleFluidPropChange(fluid.id, 'density', e.target.value)}
                              onKeyDown={preventNegative}
                          />
                      </div>

                      <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Kinematic Viscosity (ν)</span>
                              <span>mm²/s</span>
                          </div>
                          <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              value={fluid.kinematicViscosity}
                              onChange={(e) => handleFluidPropChange(fluid.id, 'kinematicViscosity', e.target.value)}
                              onKeyDown={preventNegative}
                          />
                      </div>

                      <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Specific Heat (Cp)</span>
                              <span>J/kg·K</span>
                          </div>
                          <input
                              type="number"
                              min="0"
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              value={fluid.specificHeat}
                              onChange={(e) => handleFluidPropChange(fluid.id, 'specificHeat', e.target.value)}
                              onKeyDown={preventNegative}
                          />
                      </div>

                      <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Thermal Conductivity (k)</span>
                              <span>W/m·K</span>
                          </div>
                          <input
                              type="number"
                              min="0"
                              step="0.0001"
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              value={fluid.thermalConductivity}
                              onChange={(e) => handleFluidPropChange(fluid.id, 'thermalConductivity', e.target.value)}
                              onKeyDown={preventNegative}
                          />
                      </div>

                       <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Prandtl Number (Pr)</span>
                              <span>-</span>
                          </div>
                          <input
                              type="number"
                              min="0"
                              step="0.1"
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                              value={fluid.prandtl}
                              onChange={(e) => handleFluidPropChange(fluid.id, 'prandtl', e.target.value)}
                              onKeyDown={preventNegative}
                          />
                      </div>
                  </div>
              )}
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
                        min="0"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                        value={geometry[field.key as keyof HeatSinkGeometry]}
                        onChange={(e) => handleGeoChange(field.key as keyof HeatSinkGeometry, e.target.value)}
                        onKeyDown={preventNegative}
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
                    min="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.junctionTemp}
                    onChange={(e) => handleCondChange('junctionTemp', e.target.value)}
                    onKeyDown={preventNegative}
                />
            </div>
            <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Inlet Temp (T_inlet)</span>
                    <span>°C</span>
                </div>
                <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.inletTemp}
                    onChange={(e) => handleCondChange('inletTemp', e.target.value)}
                    onKeyDown={preventNegative}
                />
            </div>
             <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Target Power (Ref)</span>
                    <span>W</span>
                </div>
                <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.maxPowerTarget}
                    onChange={(e) => handleCondChange('maxPowerTarget', e.target.value)}
                    onKeyDown={preventNegative}
                />
            </div>
             <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Target Hashrate (Ref)</span>
                    <span>TH/s</span>
                </div>
                <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
                    value={conditions.targetHashrate}
                    onChange={(e) => handleCondChange('targetHashrate', e.target.value)}
                    onKeyDown={preventNegative}
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
                    min="0"
                    className={`w-full bg-slate-950 border rounded px-2 py-1 text-slate-200 focus:outline-none transition-colors ${conditions.hashEfficiency < 10 ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'}`}
                    value={conditions.hashEfficiency}
                    onChange={(e) => handleCondChange('hashEfficiency', e.target.value)}
                    onKeyDown={preventNegative}
                />
                {conditions.hashEfficiency < 10 && (
                    <p className="text-red-400 text-[10px] mt-1 italic">
                        Currently Hashrate Efficiencies below 10 J/TH are not realistic.
                    </p>
                )}
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
