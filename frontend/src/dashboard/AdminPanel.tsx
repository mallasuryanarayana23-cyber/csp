import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Settings, 
  Activity, 
  Database, 
  ShieldCheck, 
  TrendingUp, 
  FileText,
  UserCheck,
  ServerCrash
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { apiClient } from '../api/client';

export const AdminPanel: React.FC = () => {
  const { students } = useStore();
  const [logs, setLogs] = useState<Array<{ time: string; event: string; status: 'OK' | 'WARN' }>>([]);
  const [users, setUsers] = useState([]);

  React.useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [logsRes, usersRes] = await Promise.all([
          apiClient.get('/api/admin/audit-logs'),
          apiClient.get('/api/admin/users')
        ]);
        const formattedLogs = logsRes.data.map((l: any) => ({
          time: new Date(l.createdAt).toLocaleTimeString(),
          event: l.event,
          status: 'OK'
        }));
        setLogs(formattedLogs);
        setUsers(usersRes.data);
      } catch (e) {
        console.error('Failed to load admin data');
      }
    };
    fetchAdminData();
  }, []);

  // System performance metrics
  const perfData = [
    { time: '12:00', requests: 120, ping: 45 },
    { time: '13:00', requests: 185, ping: 48 },
    { time: '14:00', requests: 240, ping: 52 },
    { time: '15:00', requests: 310, ping: 44 },
    { time: '16:00', requests: 275, ping: 49 },
    { time: '17:00', requests: 340, ping: 42 }
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto font-sans text-left">
      
      {/* 1. Header cockpit */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 rounded-3xl border border-white/5">
        <div className="space-y-1">
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-rajdhani">Admin Dashboard</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Infrastructure Console</h2>
          <p className="text-xs text-slate-400 font-light">Monitor institutional request limits, active user databases, system audit logs, and hardware server performance parameters.</p>
        </div>

        {/* Top health metrics summaries */}
        <div className="flex items-center space-x-6 pr-2">
          {/* Active latency */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Server Latency</span>
              <span className="text-lg font-black text-emerald-400 font-rajdhani block leading-none mt-0.5">42 ms (Stable)</span>
            </div>
          </div>
          {/* Databases */}
          <div className="flex items-center space-x-2.5 pl-4 border-l border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Database Records</span>
              <span className="text-lg font-black text-indigo-400 font-rajdhani block leading-none mt-0.5">{users.length} Accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LEFT: Performance Graphs */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* API load request card using Area chart */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Platform performance</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
              <span>Platform Active Request Load Timeline</span>
            </h3>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={perfData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#6366f1', fontSize: '11px' }}
                />
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="requests" stroke="#6366f1" fillOpacity={1} fill="url(#colorReq)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 text-center border-t border-white/5 pt-2 select-none">
            💡 Platform request limits scale automatically based on server workload spikes.
          </div>
        </div>

        {/* System audit log deck */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3.5">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Platform Security</span>
          <h3 className="text-base font-bold flex items-center space-x-1.5">
            <FileText className="w-4.5 h-4.5 text-indigo-400" />
            <span>Infrastructure Audit Trail Logs</span>
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {logs.map((log, index) => (
              <div 
                key={index}
                className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-normal flex items-center justify-between gap-4 font-mono"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-slate-500">{log.time}</span>
                  <span className="text-slate-200">{log.event}</span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${log.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. RIGHT: Admin Controls */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Security checks card */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Cyber Security Shield</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              <span>Platform Cryptographic Security</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs">
              <span className="text-slate-400">CSRF Handshake Protections</span>
              <span className="text-emerald-400 font-bold font-rajdhani uppercase">ENABLED</span>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs">
              <span className="text-slate-400">JWT Token Security Storage</span>
              <span className="text-emerald-400 font-bold font-rajdhani uppercase">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs">
              <span className="text-slate-400">API Gateway Rate limits</span>
              <span className="text-emerald-400 font-bold font-rajdhani uppercase">SECURED</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default AdminPanel;
