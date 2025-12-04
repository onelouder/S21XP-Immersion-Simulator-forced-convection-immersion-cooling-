import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { DataPoint, FluidProperties } from '../types';

interface ChartPanelProps {
  title: string;
  data: DataPoint[];
  fluids: FluidProperties[];
  dataKeyPrefix?: string; // Not strictly needed with dynamic keys but good for extensibility
  yLabel: string;
  targetLine?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs">
        <p className="text-slate-300 font-bold mb-2">Velocity: {label} m/s</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-slate-200 font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ChartPanel: React.FC<ChartPanelProps> = ({ title, data, fluids, yLabel, targetLine }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-200 font-semibold text-sm">{title}</h3>
        <span className="text-slate-500 text-xs">{yLabel}</span>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis 
              dataKey="velocity" 
              stroke="#94a3b8" 
              tick={{ fontSize: 11 }}
              label={{ value: 'Velocity (m/s)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} 
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fontSize: 11 }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            
            {targetLine && (
               <ReferenceLine y={targetLine} label="Target" stroke="red" strokeDasharray="3 3" opacity={0.5} />
            )}

            {fluids.map((fluid) => (
              <Line
                key={fluid.id}
                type="monotone"
                dataKey={fluid.id}
                name={fluid.name}
                stroke={fluid.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartPanel;