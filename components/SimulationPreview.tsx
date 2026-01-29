import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CommitPlan } from '../types';

interface Props {
  plan: CommitPlan[];
}

const SimulationPreview: React.FC<Props> = ({ plan }) => {
  const data = plan.map(p => ({
    date: p.date.toLocaleDateString(),
    commits: p.count,
    rawDate: p.date
  }));

  return (
    <div className="w-full h-64 bg-slate-900 rounded-lg p-4 border border-slate-800">
      <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">Projected Activity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            interval={Math.floor(data.length / 5)}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
            itemStyle={{ color: '#38bdf8' }}
          />
          <Bar dataKey="commits" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.commits > 4 ? '#22c55e' : entry.commits > 2 ? '#4ade80' : '#86efac'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationPreview;