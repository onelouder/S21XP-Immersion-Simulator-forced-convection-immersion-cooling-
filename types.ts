
// Jason Wells: Type definitions for the S21 XP Analytical Model.
// These structures mirror the input parameters defined in the project scope.

export interface FluidProperties {
  id: string;
  name: string;
  density: number; // kg/m3
  kinematicViscosity: number; // mm2/s (at 40C)
  dynamicViscosity: number; // Pa.s (at 40C)
  specificHeat: number; // J/kg.K
  thermalConductivity: number; // W/m.K
  prandtl: number;
  color: string; // Hex color for chart
}

export interface HeatSinkGeometry {
  length: number; // m (L)
  width: number; // m (W)
  finHeight: number; // m (H_fin)
  finThickness: number; // m (t_fin)
  finSpacing: number; // m (s)
  numberOfFins: number; // N_fin
  numberOfChannels: number; // N_ch
}

export interface OperatingConditions {
  junctionTemp: number; // deg C (T_j) - The upper limit driving the system
  inletTemp: number; // deg C (T_inlet) - Fluid temp entering the tank
  maxPowerTarget: number; // W (Visual reference line only)
  targetHashrate: number; // TH/s (Visual reference line only)
  hashEfficiency: number; // J/TH - Conversion factor from Power to Hashrate
}

export interface SimulationConfig {
  geometry: HeatSinkGeometry;
  conditions: OperatingConditions;
  enabledFluids: string[]; // IDs of enabled fluids
}

export interface DataPoint {
  velocity: number; // m/s
  [key: string]: number; // Dynamic keys for each fluid's value
}

export interface SimulationResult {
  powerData: DataPoint[];
  hashrateData: DataPoint[];
  outletTempData: DataPoint[];
  fluids: FluidProperties[];
}
