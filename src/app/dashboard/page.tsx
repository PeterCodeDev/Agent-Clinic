"use client";
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardOverview() {
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   const loadData = async () => {
      const res = await fetch('/api/analytics/overview');
      const json = await res.json();
      setData(json);
      setLoading(false);
   };

   useEffect(() => {
     loadData();
     
     const evtSource = new EventSource('/api/events');
     evtSource.addEventListener('visit_created', () => loadData());
     evtSource.addEventListener('visit_resolved', () => loadData());
     
     return () => evtSource.close();
   }, []);

   if (loading) return <div className="text-center mt-20 p-8 text-indigo-400">Loading Clinic Analytics...</div>;

   const ailmentData = Object.entries(data.ailment_distribution).map(([name, val]) => ({ name, value: val }));
   const severityData = Object.entries(data.severity_distribution).filter(([n,v]) => Number(v) > 0).map(([name, val], idx) => ({ name: `Severity ${name}`, value: val }));
   const COLORS = ['#60A5FA', '#818CF8', '#A78BFA', '#F472B6'];

   return (
     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
         
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-lg hover:shadow-indigo-500/10">
            <h3 className="text-sm font-medium text-slate-400">Active Patients</h3>
            <p className="mt-2 text-4xl font-semibold text-white">{data.active_patients}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-lg hover:shadow-indigo-500/10">
            <h3 className="text-sm font-medium text-slate-400">Open Visits</h3>
            <p className="mt-2 text-4xl font-semibold text-white">{data.open_visits}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-lg hover:shadow-indigo-500/10">
             <h3 className="text-sm font-medium text-slate-400">Resolution Rate</h3>
             <p className="mt-2 text-4xl font-semibold text-emerald-400">{(data.resolution_rate * 100).toFixed(1)}%</p>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
         {/* Ailment Distribution */}
         <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-medium text-slate-400">Ailment Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ailmentData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                  <Bar dataKey="value" fill="#818CF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Severity Chart */}
         <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-medium text-slate-400">Severity Distribution</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
       </div>
       
       <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
         <h3 className="mb-4 text-sm font-medium text-slate-400">Recent Visits</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
               <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
                 <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">State</th>
                    <th className="px-4 py-3 font-medium">Diagnoses</th>
                 </tr>
               </thead>
               <tbody>
                  {data.recent_visits.map((v: any) => (
                    <tr key={v.visitId} className="border-b border-white/5 transition-colors hover:bg-white/5">
                      <td className="px-4 py-3">{new Date(v.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{v.severity ? <span className="rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-300">{"Severity " + v.severity}</span> : '-'}</td>
                      <td className="px-4 py-3">
                         <span className={`rounded-full px-2 py-1 text-xs font-semibold ${v.state === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{v.state}</span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-[200px] text-slate-400">
                        {v.diagnoses ? JSON.parse(v.diagnoses).map((d: any)=>d.ailment_code).join(', ') : 'Pending'}
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
       </div>
     </div>
   );
}
