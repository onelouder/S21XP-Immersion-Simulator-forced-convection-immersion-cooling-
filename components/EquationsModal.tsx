
import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface EquationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EquationsModal: React.FC<EquationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Governing Equations & Assumptions</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 font-serif text-slate-300 leading-relaxed">
          
          {/* Section 1: Geometry & Flow */}
          <section>
            <h3 className="text-lg font-sans font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-2">1. Hydraulic & Flow Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-4 rounded border border-slate-800/50">
                <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Hydraulic Diameter</p>
                <div className="text-lg italic">
                  D<sub>h</sub> = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">4 · (s · H<sub>fin</sub>)</span><span className="block">2 · (H<sub>fin</sub> + s)</span></span>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded border border-slate-800/50">
                <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Reynolds Number</p>
                <div className="text-lg italic">
                  Re = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">v · D<sub>h</sub></span><span className="block">ν</span></span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Convection */}
          <section>
            <h3 className="text-lg font-sans font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-2">2. Heat Transfer Correlations</h3>
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800/50">
                <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Nusselt Number (Standard Laminar)</p>
                <div className="text-lg italic mb-2">
                  Nu<sub>calc</sub> = 1.86 · (Re · Pr · <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">D<sub>h</sub></span><span className="block">L</span></span>)<sup>1/3</sup>
                </div>
                <div className="text-lg italic text-emerald-400">
                  Nu = max(Nu<sub>calc</sub>, 7.54)
                </div>
                <p className="text-sm font-sans text-slate-500 mt-2">
                  * Clamped at 7.54 for fully developed flow stability at low velocities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-950 p-4 rounded border border-slate-800/50">
                    <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Convection Coefficient</p>
                    <div className="text-lg italic">
                      h = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">Nu · k</span><span className="block">D<sub>h</sub></span></span>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          {/* Section 3: Efficiency */}
          <section>
            <h3 className="text-lg font-sans font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-2">3. Fin Efficiency & Surface Effectiveness</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 rounded border border-slate-800/50">
                    <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Fin Parameter (m)</p>
                    <div className="text-lg italic">
                    m = √<span className="inline-block border-t border-slate-600 pt-1"><span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">2 · h</span><span className="block">k<sub>Al</sub> · t<sub>fin</sub></span></span></span>
                    </div>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-800/50">
                    <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Fin Efficiency</p>
                    <div className="text-lg italic">
                    η<sub>fin</sub> = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">tanh(m · H<sub>fin</sub>)</span><span className="block">m · H<sub>fin</sub></span></span>
                    </div>
                </div>
            </div>
            <div className="bg-slate-950 p-4 rounded border border-slate-800/50 mt-4">
                <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Overall Surface Efficiency</p>
                <div className="text-lg italic">
                    η<sub>o</sub> = 1 - (<span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">A<sub>fin</sub></span><span className="block">A<sub>total</sub></span></span>) · (1 - η<sub>fin</sub>)
                </div>
            </div>
          </section>

          {/* Section 4: Thermal Circuit */}
          <section>
            <h3 className="text-lg font-sans font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-2">4. Thermal Resistance & Power</h3>
            <div className="bg-slate-950 p-4 rounded border border-slate-800/50 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-1">Mass Flow Rate</p>
                        <div className="text-lg italic">ṁ = ρ · v · A<sub>front</sub></div>
                    </div>
                    <div>
                        <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-1">Capacity Rate</p>
                        <div className="text-lg italic">C<sub>min</sub> = ṁ · c<sub>p</sub></div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                     <div>
                        <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-1">NTU</p>
                        <div className="text-lg italic">
                            NTU = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">η<sub>o</sub> · h · A<sub>total</sub></span><span className="block">C<sub>min</sub></span></span>
                        </div>
                     </div>
                     <div>
                        <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-1">Effectiveness (ε)</p>
                        <div className="text-lg italic">ε = 1 - exp(-NTU)</div>
                     </div>
                 </div>

                 <div className="pt-4 border-t border-slate-800">
                    <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-2">Total Thermal Circuit (Per Face)</p>
                    <div className="flex flex-wrap gap-4 text-lg italic">
                        <span>R<sub>stream</sub> = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">1</span><span className="block">ε · C<sub>min</sub></span></span></span>
                        <span className="text-slate-500 mx-2">→</span>
                        <span>R<sub>total</sub> = R<sub>cond</sub> + R<sub>stream</sub></span>
                        <span className="text-slate-500 mx-2">→</span>
                        <span>Q<sub>face</sub> = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">T<sub>j</sub> - T<sub>inlet</sub></span><span className="block">R<sub>total</sub></span></span></span>
                    </div>
                 </div>
            </div>
          </section>
          
          {/* Section 5: Hashrate */}
          <section>
             <h3 className="text-lg font-sans font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-2">5. System Outputs</h3>
             <div className="bg-slate-950 p-4 rounded border border-slate-800/50 flex flex-col md:flex-row gap-8">
                 <div>
                    <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-1">Outlet Temperature</p>
                    <div className="text-lg italic">
                       T<sub>outlet</sub> = T<sub>inlet</sub> + <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">Q<sub>face</sub></span><span className="block">C<sub>min</sub></span></span>
                    </div>
                 </div>
                 <div>
                    <p className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-1">Total Hashrate</p>
                    <div className="text-lg italic">
                        H<sub>total</sub> = <span className="inline-block align-middle text-center"><span className="block border-b border-slate-600">Q<sub>total</sub></span><span className="block">η<sub>hash</sub></span></span>
                    </div>
                 </div>
             </div>
          </section>

          {/* Section 6: Assumptions */}
          <section className="bg-indigo-950/20 border border-indigo-900/30 p-6 rounded-lg font-sans text-sm text-indigo-200">
            <h4 className="font-bold text-indigo-300 mb-3 uppercase tracking-wide">Key Model Assumptions</h4>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong className="text-white">Flow Regime:</strong> Analysis is valid for Laminar Flow (Re &lt; 2300).</li>
                <li><strong className="text-white">Fluid Properties:</strong> Assumed constant at 40°C.</li>
                <li><strong className="text-white">Developing Flow:</strong> Sieder-Tate correlation used for developing regions; clamped at Nu=7.54 for fully developed limits.</li>
                <li><strong className="text-white">Resistance Network:</strong> Includes fixed internal chip-to-heatsink resistance (R_cond) in series with the convective fluid resistance (R_stream), acting as a thermal voltage divider.</li>
                <li><strong className="text-white">No Enhancements:</strong> Model assumes straight-fin parallel plate channels without turbulators or twisted tapes.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default EquationsModal;
