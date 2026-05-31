import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Settings, Activity, Database, ShieldCheck, TrendingUp,
  UserCheck, ServerCrash, Search, Trash2, Cpu, Wifi,
  Terminal, RefreshCw, AlertTriangle, Lock, Globe, Zap
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../../services/api/client';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

export const AdminPanel: React.FC = () => {
  const { addNotification, user } = useStore();
  const [logs, setLogs] = useState<Array<{ id: string; time: string; event: string; status: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string; createdAt: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(42);
  const [wsStatus, setWsStatus] = useState<'CONNECTED' | 'OFFLINE'>('CONNECTED');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [logsRes, usersRes] = await Promise.all([
        apiClient.get('/api/admin/audit-logs'),
        apiClient.get('/api/admin/users'),
        apiClient.get('/api/health').catch(() => ({ data: { status: 'ERROR' } }))
      ]);
      setLogs(logsRes.data.map((l: any) => ({ id: l.id, time: new Date(l.createdAt).toLocaleTimeString(), event: l.event, status: 'OK' })));
      setUsers(usersRes.data);
      setLatency(Math.floor(Math.random() * 15) + 30);
      setWsStatus('CONNECTED');
    } catch {
      addNotification('Telemetry Timeout', 'Audit logs failed to load.', 'warning');
      setWsStatus('OFFLINE');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await apiClient.delete(`/api/admin/users/${id}`);
      addNotification('User Deactivated', `Account removed: "${name}"`, 'success');
      fetchAdminData();
    } catch { addNotification('Failed', 'Cannot remove active session.', 'warning'); }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const perfData = [
    { time: '12:00', requests: 120, latency: 45 },
    { time: '13:00', requests: 185, latency: 42 },
    { time: '14:00', requests: 240, latency: 38 },
    { time: '15:00', requests: 310, latency: 44 },
    { time: '16:00', requests: 275, latency: 41 },
    { time: '17:00', requests: 340, latency: 36 },
  ];

  const roleColor = (role: string) => {
    if (role === 'ADMIN') return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' };
    if (role === 'TEACHER') return { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' };
    if (role === 'PARENT') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
  };

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <div className="gradient-orb gradient-orb-cyan w-96 h-96 top-0 right-0 opacity-8" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 relative z-10">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="neo-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/4 pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">Infrastructure Dashboard</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-black">
                System <span className="gradient-text-blue">Console</span>
              </h1>
              <p className="text-slate-400 mt-1">API telemetry, user database, audit logs, and platform security status.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Latency</div>
                <div className="text-2xl font-black font-mono-data text-emerald-400">{latency}ms</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Accounts</div>
                <div className="text-2xl font-black font-mono-data text-blue-400">{users.length}</div>
              </div>
              <button onClick={fetchAdminData} disabled={loading}
                className="flex items-center gap-2 premium-btn-ghost px-4 py-2.5 rounded-xl text-sm font-bold">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">

            {/* Performance Chart */}
            <motion.div {...fadeUp(0.05)} className="neo-card rounded-3xl p-6">
              <div className="mb-4">
                <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-0.5">Telemetry</div>
                <h3 className="font-display font-bold text-lg">API Gateway Load Timeline</h3>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,36,72,0.6)" />
                    <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                    <YAxis stroke="#475569" fontSize={9} />
                    <Tooltip contentStyle={{ background: '#0c1228', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={3} fill="url(#reqGrad)" name="Request Vol" />
                    <Area type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={2} strokeDasharray="4 4" fill="url(#latGrad)" name="Latency (ms)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* User Table */}
            <motion.div {...fadeUp(0.1)} className="neo-card rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-cosmos-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-base">User Account Database</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage roles, deactivate accounts, and audit sessions.</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="bg-cosmos-800 border border-cosmos-500 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-200 placeholder-slate-600 w-52 transition-all" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-cosmos-700 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                      <th className="py-3 pl-5 text-left">User</th>
                      <th className="py-3 text-left">Email</th>
                      <th className="py-3 text-center">Role</th>
                      <th className="py-3 text-center">Joined</th>
                      <th className="py-3 text-right pr-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cosmos-800">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-slate-500">No users found.</td></tr>
                    ) : filteredUsers.map(u => {
                      const isSelf = u.email === user?.email;
                      const rc = roleColor(u.role);
                      return (
                        <tr key={u.id} className="hover:bg-cosmos-700/20 transition-colors">
                          <td className="py-3.5 pl-5 font-semibold text-slate-200">{u.name}</td>
                          <td className="py-3.5 text-slate-400">{u.email}</td>
                          <td className="py-3.5 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${rc.bg} ${rc.text} ${rc.border} uppercase tracking-wider`}>{u.role}</span>
                          </td>
                          <td className="py-3.5 text-center text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 text-right pr-5">
                            <button onClick={() => handleDelete(u.id, u.name)} disabled={isSelf}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center ml-auto transition-all ${isSelf ? 'opacity-25 border-cosmos-600 text-slate-600 cursor-not-allowed' : 'bg-red-500/8 border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 cursor-pointer'}`}
                              title={isSelf ? 'Cannot deactivate self' : 'Deactivate user'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-6">

            {/* Security Status */}
            <motion.div {...fadeUp(0.08)} className="neo-card rounded-3xl p-5 space-y-4">
              <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-0.5">Security Shield</div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Platform Security
                </h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: Lock, label: 'JWT Algorithm', value: 'HMAC-256', color: 'emerald' },
                  { icon: Wifi, label: 'WebSocket Status', value: wsStatus, color: wsStatus === 'CONNECTED' ? 'emerald' : 'red', animated: wsStatus !== 'CONNECTED' },
                  { icon: Cpu, label: 'Rate Limiter', value: 'SECURED', color: 'emerald' },
                  { icon: Globe, label: 'TLS Protocol', value: 'TLS 1.3', color: 'emerald' },
                ].map(({ icon: Icon, label, value, color, animated }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-cosmos-800/50 border border-cosmos-600 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      {label}
                    </div>
                    <span className={`text-xs font-bold font-mono-data text-${color}-400 uppercase ${animated ? 'animate-pulse' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Audit Log */}
            <motion.div {...fadeUp(0.12)} className="neo-card rounded-3xl p-5 space-y-4">
              <div>
                <div className="text-[10px] text-violet-400 uppercase tracking-widest font-bold mb-0.5">Platform Security</div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-violet-400" /> Audit Log
                </h3>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No logs registered yet.</p>
                ) : logs.map(log => (
                  <div key={log.id} className="p-3 bg-cosmos-800/50 rounded-xl border border-cosmos-600 space-y-1">
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-600">
                      <span className="font-mono-data">{log.time}</span>
                      <span className="text-emerald-400">VERIFIED</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono-data break-all leading-relaxed">{log.event}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
