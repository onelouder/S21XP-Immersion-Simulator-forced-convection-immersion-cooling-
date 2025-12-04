
import { FluidProperties, HeatSinkGeometry, OperatingConditions } from './types';

// Jason Wells: Fluid properties extracted from the "Cooling Fluid Properties" PDF.
// All values are at 40°C reference temperature.
export const AVAILABLE_FLUIDS: FluidProperties[] = [
  {
    id: 'dcf281',
    name: 'DCF-281 (Novvi)',
    density: 793.36,
    kinematicViscosity: 10.41,
    dynamicViscosity: 0.0082589,
    specificHeat: 2110,
    thermalConductivity: 0.14059,
    prandtl: 123.9,
    color: '#3b82f6', // Blue 500
  },
  {
    id: 'shell_xhvi3',
    name: 'Shell XHVI3 (GTL 3)',
    density: 790.2,
    kinematicViscosity: 9.99,
    dynamicViscosity: 0.0078941,
    specificHeat: 2070,
    thermalConductivity: 0.13702,
    prandtl: 119.2,
    color: '#22c55e', // Green 500
  },
  {
    id: 'castrol_dc15',
    name: 'Castrol DC15',
    density: 819,
    kinematicViscosity: 7.50,
    dynamicViscosity: 0.0061425,
    specificHeat: 2200,
    thermalConductivity: 0.134,
    prandtl: 100.8,
    color: '#ef4444', // Red 500
  },
  {
    id: 'valvoline_hpc',
    name: 'Valvoline HPC DE1',
    density: 811.5,
    kinematicViscosity: 8.01,
    dynamicViscosity: 0.0065001,
    specificHeat: 2000,
    thermalConductivity: 0.1304,
    prandtl: 99.7,
    color: '#f59e0b', // Amber 500
  },
  {
    id: 'fuchs_renolin',
    name: 'Fuchs Renolin FECC 5',
    density: 826,
    kinematicViscosity: 4.96,
    dynamicViscosity: 0.0040970,
    specificHeat: 2200,
    thermalConductivity: 0.134,
    prandtl: 67.2,
    color: '#ec4899', // Pink 500
  },
  {
    id: 'novel_mpao',
    name: 'Novel MPAO Dimer',
    density: 794.8,
    kinematicViscosity: 7.994,
    dynamicViscosity: 0.0063454,
    specificHeat: 2270,
    thermalConductivity: 0.15203,
    prandtl: 94.7,
    color: '#a855f7', // Purple 500
  },
];

// Jason Wells: Geometry derived from S21 XP heat sink physical measurements.
// Verified against "Heat Sink Geometry per Face" in PDF Page 2.
export const DEFAULT_GEOMETRY: HeatSinkGeometry = {
  length: 0.28,
  width: 0.17,
  finHeight: 0.025,
  finThickness: 0.0015,
  finSpacing: 0.002,
  numberOfFins: 49,
  numberOfChannels: 48,
};

// Jason Wells: Default operating parameters.
// Hash Efficiency updated to 14.5 J/TH as per latest user requirement.
export const DEFAULT_CONDITIONS: OperatingConditions = {
  junctionTemp: 70, // Conservative default, user can max to 85
  inletTemp: 40,
  maxPowerTarget: 5700, // Approximate S21 XP target
  targetHashrate: 300, // TH/s target
  hashEfficiency: 14.5, // J/TH (Updated default)
  
  // Financial Defaults
  bitcoinPrice: 93000, // USD
  baselinePrice: 93000, // USD
  rewardPerTh: 0.0358, // USD/TH/s/day
  totalFacilityPowerMW: 300.0, // Default 300 MW facility as requested
};

// Physics Constants
export const ALUMINUM_CONDUCTIVITY = 201; // W/m.K
export const TOTAL_FACES = 6;
export const TOTAL_CHIPS = 273; // Total chips in the system

// Jason Wells: Thermal Resistance Budget
// Derived from BM1370 chip geometry + Fujipoly SPG-30B TIM.
// R_fixed = 1.48 K/W (theta_jc + theta_cs)
export const THERMAL_RESISTANCE_CHIP = 1.48;
