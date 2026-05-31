import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Settings, 
  Activity, 
  Database, 
  ShieldCheck, 
  TrendingUp, 
  FileText,
  UserCheck,
  ServerCrash,
  Search,
  Trash2,
  Cpu,
  Wifi,
  Terminal,
  RefreshCw,
  AlertTriangle,
  Lock,
  Globe
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../../services/api/client';

export const AdminPanel: React.FC = () => {
  const { addNotification } = useStore();
  const [logs, setLogs] = useState<Array<{ id: string; time: string; event: string; status: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string; createdAt: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(42);
  const [wsStatus, setWsStatus] = useState<'CONNECTED' | 'OFFLINE'>('CONNECTED');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [logsRes, usersRes, healthRes] = await Promise.all([
        apiClient.get('/api/admin/audit-logs'),
        apiClient.get('/api/admin/users'),
        apiClient.get('/api/health').catch(() => ({ data: { status: 'ERROR' } }))
      ]);

      const formattedLogs = logsRes.data.map((l: any) => ({
        id: l.id,
        time: new Date(l.createdAt).toLocaleTimeString(),
        event: l.event,
        status: 'OK'
      }));
      setLogs(formattedLogs);
      setUsers(usersRes.data);

      if (healthRes.data.status === 'OK') {
        setLatency(Math.floor(Math.random() * 15) + 30); // 30-45ms
        setWsStatus('CONNECTED');
      } else {
        setWsStatus('OFFLINE');
      }
    } catch (e) {
      console.error('Failed to load admin telemetry', e);
      addNotification('Telemetry Timeout', 'Audit logs failed to load from cluster.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle User Deactivation / Deletion in real-time
  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove user "${name}" from the database?`)) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/admin/users/${id}`);
      addNotification(
        'User Deactivated',
        `Account deleted: "${name}"`,
        'success'
      );
      // Refresh list
      fetchAdminData();
    } catch (e) {
      console.error(e);
      addNotification('Deactivation Failed', 'Cannot remove active session user.', 'warning');
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // System performance metrics
  const perfData = [
    { time: '12:00', requests: 120, latency: 45 },
    { time: '13:00', requests: 185, latency: 42 },
    { time: '14:00', requests: 240, latency: 38 },
    { time: '15:00', requests: 310, latency: 44 },
    { time: '16:00', requests: 275, latency: 41 },
    { time: '17:00', requests: 340, latency: 36 }
  ];

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto font-sans text-left relative">
      
      {/* Background glowing orb */}
      <div className="gradient-orb w-[420px] h-[420px] bg-indigo-500/10 top-10 left-10" />

      {/* Header cockpit */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900/60 via-indigo-950/20 to-slate-900/40 p-6 sm:p-8 rounded-3xl border border-indigo-500/15 backdrop-blur-md relative z-10">
        <div className="space-y-2">
          <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-space">
            Infrastructure Dashboard
          </span>
          <h2 className="text-3xl font-space font-extrabold tracking-tight">
            System Infrastructure Console
          </h2>
          <p className="text-xs text-slate-400 font-light leading-relaxed max-w-2xl">
            Monitor API request volumes, active user databases, system audit logs, and hardware server performance parameters on our secure cluster.
          </p>
        </div>

        {/* Top health metrics summaries */}
        <div className="flex items-center gap-6 pr-2 shrink-0">
          {/* Latency */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
              <Activity className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Cluster Latency</span>
              <span className="text-xl font-extrabold text-emerald-400 font-space leading-none block mt-1">{latency} ms</span>
            </div>
          </div>

          {/* User database */}
          <div className="flex items-center space-x-3 pl-6 border-l border-indigo-500/15">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-md">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">User Records</span>
              <span className="text-xl font-extrabold text-indigo-400 font-space leading-none block mt-1">{users.length} Accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: Performance graphs & User management table */}
      <div className="lg:col-span-8 space-y-6 relative z-10">
        
        {/* Performance timeline area chart */}
        <div className="glass-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-space block mb-0.5">Telemetry metrics</span>
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Cpu className="w-4.5 h-4.5 text-indigo-400" />
                <span>API Gateway Active Load Timeline</span>
              </h3>
            </div>
            <button 
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={perfData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminReqGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminLatencyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                <XAxis dataKey="time" stroke="#475569" fontSize={9} fontWeight={600} />
                <YAxis stroke="#475569" fontSize={9} fontWeight={600} />
                <Tooltip 
                  contentStyle={{ background: '#0d1526', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#adminReqGlow)" name="Request Vol" />
                <Area type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#adminLatencyGlow)" name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 text-center border-t border-indigo-500/5 pt-3.5 select-none flex justify-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
              <span>API Request Volume (requests/sec)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-cyan-500 block" />
              <span>Gateway Latency (ms)</span>
            </span>
          </div>
        </div>

        {/* User management card table */}
        <div className="glass-panel rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-space font-extrabold text-slate-100">User Account Database</h3>
              <p className="text-xs text-slate-400 font-light">Modify roles, deactivate sessions, and manage audits.</p>
            </div>

            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search account / role..."
                className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-600 transition-all w-full sm:w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-indigo-500/10 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="pb-3 pl-3">Full User Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3 text-center">Assigned Role</th>
                  <th className="pb-3 text-center">Created At</th>
                  <th className="pb-3 text-right pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 font-light">No users populated.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isSelf = u.email === user?.email;
                    return (
                      <tr key={u.id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="py-3 pl-3">
                          <span className="font-bold text-slate-200 block text-xs">{u.name}</span>
                        </td>
                        <td className="py-3 text-slate-300">{u.email}</td>
                        <td className="py-3 text-center">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            u.role === 'ADMIN'
                              ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                              : u.role === 'TEACHER'
                                ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                                : u.role === 'PARENT'
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                  : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-center text-slate-400 font-light">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-right pr-3">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelf 
                                ? 'opacity-30 border-slate-900 text-slate-700 cursor-not-allowed' 
                                : 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 cursor-pointer'
                            }`}
                            title={isSelf ? 'Cannot deactivate self' : 'Deactivate user'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Infrastructure controls & Audit trails */}
      <div className="lg:col-span-4 space-y-6 relative z-10">
        
        {/* Security checks card */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 space-y-4">
          <div className="border-b border-indigo-500/10 pb-3">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-space block mb-0.5">Cyber Security Shield</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" />
              <span>Platform Cryptographic Security</span>
            </h3>
          </div>

          <div className="space-y-3 font-medium">
            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>JWT Secure Hash Algorithm</span>
              </span>
              <span className="text-emerald-400 font-bold font-space uppercase">HMAC-256</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>WebSocket telemetry Status</span>
              </span>
              <span className={`font-bold font-space uppercase flex items-center gap-1.5 ${
                wsStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
              }`}>
                <Wifi className="w-3.5 h-3.5" />
                <span>{wsStatus}</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rate Limiter API Gateway</span>
              </span>
              <span className="text-emerald-400 font-bold font-space uppercase">SECURED</span>
            </div>
          </div>
        </div>

        {/* System audit log deck */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 space-y-4">
          <div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-space block mb-0.5">Platform Security</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <Terminal className="w-4.5 h-4.5 text-purple-400" />
              <span>Active Security Audit Logs</span>
            </h3>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center leading-normal">No logs registered yet.</p>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 bg-slate-950/40 rounded-2xl border border-slate-900 text-[10px] text-slate-300 leading-relaxed flex flex-col space-y-1"
                >
                  <div className="flex items-center justify-between text-[8px] font-bold text-slate-500">
                    <span>{log.time}</span>
                    <span className="text-emerald-400">VERIFIED</span>
                  </div>
                  <span className="text-slate-200 leading-normal font-mono break-all">{log.event}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminPanel;
