import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Brain, Bell, User, LogOut, ChevronDown, Settings,
  Eye, Volume2, BookOpen, X, CheckCircle, AlertTriangle, Info, Layers
} from 'lucide-react';

const roleConfig = {
  STUDENT: { label: 'Student', color: 'blue', emoji: '🎓' },
  TEACHER: { label: 'Teacher', color: 'violet', emoji: '📊' },
  PARENT:  { label: 'Parent',  color: 'cyan',   emoji: '💙' },
  ADMIN:   { label: 'Admin',   color: 'emerald', emoji: '⚙️' },
} as const;

export const Navbar: React.FC = () => {
  const {
    user, activeRole, setRole, logout,
    accessibility, toggleAccessibility, setFontScale,
    notifications, markNotificationRead
  } = useStore();

  const [showNotify, setShowNotify] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAccess, setShowAccess] = useState(false);

  const unread = notifications.filter(n => !n.read).length;
  const role = activeRole ? roleConfig[activeRole] : null;

  const notifIcon = (type: string) => {
    if (type === 'success') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    if (type === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    return <Info className="w-3.5 h-3.5 text-blue-400" />;
  };

  return (
    <>
      {/* ── Floating Pill Nav ─────────────────────────── */}
      <nav className="sticky top-0 z-50 px-4 pt-3 pb-1">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="floating-nav rounded-2xl px-4 py-2.5 flex items-center justify-between max-w-7xl mx-auto"
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-base tracking-tight hidden sm:block">
              Neuro<span className="gradient-text-blue">Learn</span>
            </span>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex items-center gap-0.5 bg-cosmos-800/60 rounded-xl p-1 border border-cosmos-500">
            {(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'] as const).map(r => {
              const active = activeRole === r;
              const rc = roleConfig[r];
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-tab-bg"
                      className={`absolute inset-0 rounded-lg bg-gradient-to-r ${
                        r === 'STUDENT' ? 'from-blue-600 to-blue-700' :
                        r === 'TEACHER' ? 'from-violet-600 to-violet-700' :
                        r === 'PARENT'  ? 'from-cyan-600 to-cyan-700' :
                        'from-emerald-600 to-emerald-700'
                      }`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 hidden md:inline">{rc.label}</span>
                  <span className="relative z-10 md:hidden">{rc.emoji}</span>
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">

            {/* Accessibility */}
            <button
              onClick={() => { setShowAccess(true); setShowNotify(false); setShowProfile(false); }}
              className="w-8 h-8 rounded-xl bg-cosmos-700/50 border border-cosmos-500 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-blue-500/30 transition-all"
              title="Accessibility"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotify(s => !s); setShowProfile(false); }}
                className="relative w-8 h-8 rounded-xl bg-cosmos-700/50 border border-cosmos-500 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-blue-500/30 transition-all"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotify && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-80 glass-panel-bright rounded-2xl p-3 border border-cosmos-500 shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="text-xs font-bold text-slate-300">Notifications</span>
                      <button onClick={() => setShowNotify(false)} className="text-slate-500 hover:text-slate-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
                      ) : notifications.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${n.read ? 'opacity-50' : 'bg-cosmos-700/40 hover:bg-cosmos-700/60'}`}
                        >
                          <div className="mt-0.5 flex-shrink-0">{notifIcon(n.type)}</div>
                          <div>
                            <p className="text-[11px] font-semibold text-slate-200">{n.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(s => !s); setShowNotify(false); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-cosmos-700/50 border border-cosmos-500 hover:border-blue-500/30 transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-300 hidden sm:block max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 w-56 glass-panel-bright rounded-2xl p-2 border border-cosmos-500 shadow-2xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-cosmos-600 mb-1">
                      <p className="text-xs font-bold text-slate-200">{user?.name}</p>
                      <p className="text-[10px] text-slate-500">{user?.email}</p>
                      {role && (
                        <span className={`mt-1.5 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-${role.color}-500/10 border border-${role.color}-500/20 text-${role.color}-400 uppercase tracking-wider`}>
                          {role.emoji} {role.label}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { logout(); setShowProfile(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/8 hover:text-red-300 transition-all font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* ── Accessibility Drawer ─────────────────────── */}
      <AnimatePresence>
        {showAccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAccess(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-80 z-50 glass-panel-bright border-l border-cosmos-500 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg">Accessibility</h3>
                <button onClick={() => setShowAccess(false)} className="w-8 h-8 rounded-xl bg-cosmos-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'dyslexiaFont' as const, icon: BookOpen, label: 'Dyslexia Font', desc: 'OpenDyslexic typeface with expanded spacing', color: 'blue' },
                  { key: 'highContrast' as const, icon: Eye, label: 'High Contrast', desc: 'Maximum contrast for low vision', color: 'amber' },
                  { key: 'readingRuler' as const, icon: Layers, label: 'Reading Ruler', desc: 'Follow-cursor reading guide line', color: 'emerald' },
                  { key: 'voiceNavigation' as const, icon: Volume2, label: 'Voice Navigation', desc: 'Audio confirmations for actions', color: 'violet' },
                ].map(({ key, icon: Icon, label, desc, color }) => (
                  <button
                    key={key}
                    onClick={() => toggleAccessibility(key)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                      accessibility[key]
                        ? `bg-${color}-500/10 border-${color}-500/30`
                        : 'bg-cosmos-700/40 border-cosmos-500 hover:border-cosmos-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      accessibility[key] ? `bg-${color}-500/20 text-${color}-400` : 'bg-cosmos-600 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-200">{label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${
                      accessibility[key] ? `bg-${color}-500` : 'bg-cosmos-500'
                    }`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        accessibility[key] ? 'left-4' : 'left-0.5'
                      }`} />
                    </div>
                  </button>
                ))}

                <div className="bg-cosmos-700/40 rounded-xl p-4 border border-cosmos-500 space-y-3 mt-2">
                  <p className="text-xs font-semibold text-slate-300">Font Scale</p>
                  <input
                    type="range" min={0.8} max={1.4} step={0.05}
                    defaultValue={accessibility.fontSizeScale}
                    onChange={e => setFontScale(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>80%</span><span>100%</span><span>140%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
