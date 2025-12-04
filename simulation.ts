
import { FluidProperties, HeatSinkGeometry, OperatingConditions, DataPoint, SimulationResult } from './types';
import { AVAILABLE_FLUIDS, ALUMINUM_CONDUCTIVITY, TOTAL_FACES, TOTAL_CHIPS, THERMAL_RESISTANCE_CHIP } from './constants';

// Jason Wells:
// This simulation engine implements the "Improved S21 XP Forced Convection Analytical Solution".
// It specifically models the "Standard Laminar Flow" regime as detailed in the project documentation.
//
// Key Assumptions verified:
// 1. Flow is Laminar (Re < 2300).
// 2. We use the Sieder-Tate correlation for developing laminar flow, clamped at Nu=7.54 for fully developed regions.
// 3. The thermal circuit includes both convective resistance (fluid) and conductive resistance (chip-to-heatsink).
// 4. Fluid properties are constant at 40°C (reasonable approximation for the Delta T we expect).

// Helper: Calculate Hydraulic Diameter
// Jason Wells: Validating geometry calc against PDF Page 2.
// Dh = 4 * Area / Perimeter.
// Area = s * H_fin
// Perimeter = 2 * (H_fin + s)
// Matches standard duct hydraulic diameter calc.
const calculateHydraulicDiameter = (s: number, hFin: number): number => {
  return (4 * (s * hFin)) / (2 * (hFin + s));
};

// Helper: Standard Laminar Flow Correlation (Sieder-Tate / Developing Laminar)
// Jason Wells: Implementing Analytical Procedure Step 3 (PDF Page 5).
// We use the maximum of the developing flow correlation and the fully developed limit.
// Nu_developing = 1.86 * (Re * Pr * Dh/L)^(1/3)
// Nu_fully_developed = 7.54 (Infinite parallel plates constant heat flux/temp approximation)
// This handles the "discontinuity" or transition at low velocities (~0.1 m/s) correctly.
const calculateNusseltStandard = (
  Re: number,
  Pr: number,
  Dh: number,
  L: number
): number => {
  const nuCalc = 1.86 * Math.pow(Re * Pr * (Dh / L), 1 / 3);
  return Math.max(nuCalc, 7.54);
};

export const runSimulation = (
  fluids: string[],
  geo: HeatSinkGeometry,
  cond: OperatingConditions
): SimulationResult => {
  const powerData: DataPoint[] = [];
  const hashrateData: DataPoint[] = [];
  const outletTempData: DataPoint[] = [];

  const activeFluids = AVAILABLE_FLUIDS.filter(f => fluids.includes(f.id));
  
  // Jason Wells: Geometry Pre-calculation
  // Matches PDF Page 2 "Heat Sink Geometry per Face".
  const Dh = calculateHydraulicDiameter(geo.finSpacing, geo.finHeight);
  const A_front = geo.width * geo.finHeight; // Frontal area for mass flow calc
  
  // Surface areas per face (Step 6 of procedure on PDF page 5)
  // A_fin: Total surface area of the fins (2 sides per fin)
  const A_fin = geo.numberOfFins * 2 * geo.finHeight * geo.length;
  // A_base: Exposed base area between fins
  const A_base = geo.numberOfChannels * geo.finSpacing * geo.length;
  const A_total = A_fin + A_base;

  // Jason Wells: Thermal Resistance Setup
  // We are modeling the full thermal path: Junction -> Case -> Heatsink Base -> Fluid.
  // The user requested we include the fixed chip resistance (R_fixed ~1.48 K/W total).
  // Since we model "per face", we calculate the effective resistance of the chip array on that face.
  // Resistors in parallel: R_face = R_single_chip / N_chips_per_face.
  const chipsPerFace = TOTAL_CHIPS / TOTAL_FACES; // 273 / 6 = 45.5 chips
  const R_cond_face = THERMAL_RESISTANCE_CHIP / chipsPerFace; 

  // Jason Wells: Velocity Sweep Configuration
  // Range: 0.006 m/s to 0.100 m/s (Deeply laminar regime)
  // Step: 1 mm/s for high-resolution plotting.
  const startV_mm = 6;   // 0.006 m/s
  const endV_mm = 100;   // 0.100 m/s
  const stepV_mm = 1;    // 0.001 m/s

  for (let v_mm = startV_mm; v_mm <= endV_mm; v_mm += stepV_mm) {
    const v = v_mm / 1000; // m/s
    
    const pPoint: DataPoint = { velocity: v };
    const hPoint: DataPoint = { velocity: v };
    const tPoint: DataPoint = { velocity: v };

    activeFluids.forEach(fluid => {
      // 1. Calculate Reynolds Number (Re)
      // Re = (v * Dh) / kinematic_viscosity
      // Note: fluid.kinematicViscosity is mm2/s, converting to m2/s (1e-6).
      const nu_m2s = fluid.kinematicViscosity * 1e-6;
      const Re = (v * Dh) / nu_m2s;

      // 2. Calculate Nusselt Number (Nu)
      // Using Step 3 of analytical procedure.
      const Nu = calculateNusseltStandard(Re, fluid.prandtl, Dh, geo.length);

      // 3. Calculate Convection Coefficient (h)
      // h = Nu * k / Dh (Step 4)
      const h = (Nu * fluid.thermalConductivity) / Dh;

      // 4. Fin Efficiency (eta_fin)
      // Standard fin efficiency formula for rectangular fins (Step 5).
      // Assuming adiabatic tip (tanh(mL)/mL).
      const m = Math.sqrt((2 * h) / (ALUMINUM_CONDUCTIVITY * geo.finThickness));
      const mH = m * geo.finHeight;
      const eta_fin = Math.tanh(mH) / mH;

      // 5. Overall Surface Efficiency (eta_o)
      // Weighted average of finned and un-finned surfaces (Step 9).
      const eta_o = 1 - (A_fin / A_total) * (1 - eta_fin);

      // 6. UA Product
      // Total effective convective conductance per face (Step 10).
      const UA = eta_o * h * A_total;

      // 7. Mass Flow Rate (m_dot)
      // Mass flow through the frontal area of one face (Step 11).
      const m_dot = fluid.density * v * A_front;

      // 8. NTU and Effectiveness (epsilon)
      // Using epsilon-NTU method for heat exchangers (Step 12).
      // C_min = Heat Capacity Rate
      const C_min = m_dot * fluid.specificHeat; 
      const NTU = UA / C_min;
      
      // Effectiveness for constant wall temp (or phase change, or high capacity ratio) approximation.
      // This is appropriate here because we are solving for the limit where T_junction is fixed max.
      const epsilon = 1 - Math.exp(-NTU);

      // 9. Heat Transfer (Q_face)
      // Jason Wells: IMPORTANT DEVIATION FROM SIMPLIFIED MODEL
      // We are not just using Q = epsilon * Cmin * (Tj - Tin).
      // We must account for the voltage divider effect of the thermal resistances.
      //
      // Path: Junction --(R_cond)--> Heatsink --(R_conv)--> Fluid
      // R_cond = R_cond_face (calculated above)
      // R_conv (effective) = 1 / (epsilon * C_min)  <-- Derived from Q = epsilon * Cmin * DeltaT
      //
      // Total Resistance R_total = R_cond + R_conv
      
      const R_stream = 1 / (epsilon * C_min);
      const R_total_path = R_cond_face + R_stream;
      
      const deltaT_driving = cond.junctionTemp - cond.inletTemp;
      
      // Ohm's Law for Heat: Flow = Potential / Resistance
      const Q_face = deltaT_driving / R_total_path;

      // 10. Total System Power
      const Q_total = TOTAL_FACES * Q_face;

      // 11. Outlet Temperature
      // Energy Balance: Q = m_dot * cp * (Tout - Tin)
      // Tout = Tin + Q / (m_dot * cp)
      const T_outlet = cond.inletTemp + (Q_face / C_min);

      // 12. Hashrate Calculation
      // Derived from Power using the Efficiency metric (J/TH)
      // H_total = Q_total / Efficiency
      const H_total = Q_total / cond.hashEfficiency; // TH/s

      pPoint[fluid.id] = parseFloat(Q_total.toFixed(2));
      hPoint[fluid.id] = parseFloat(H_total.toFixed(2));
      tPoint[fluid.id] = parseFloat(T_outlet.toFixed(2));
    });

    powerData.push(pPoint);
    hashrateData.push(hPoint);
    outletTempData.push(tPoint);
  }

  return {
    powerData,
    hashrateData,
    outletTempData,
    fluids: activeFluids
  };
};
