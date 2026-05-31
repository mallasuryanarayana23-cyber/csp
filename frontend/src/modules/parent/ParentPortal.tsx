import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import {
  Heart, Award, Flame, Calendar, Sparkles, TrendingUp, Info,
  ChevronRight, BookOpen, Mail, CheckCircle, Activity, AlertCircle,
  ArrowUpRight, Brain, Eye, Target, Lightbulb, Link2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../../services/api/client';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

export const ParentPortal: React.FC = () => {
  const { students, aiReports, user, fetchStudents, fetchReports, addNotification } = useStore();
  const [childEmail, setChildEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linked, setLinked] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const child = students.find(s => s.parentId === user?.id) || students[0]; // fallback to first for demo
  const report = child ? aiReports.find(r => r.studentId === child.id) : null;

  useEffect(() => { if (child?.id) fetchReports(child.id); }, [child?.id]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childEmail) return;
    setLinking(true); setLinkError('');
    try {
      await apiClient.post('/api/parent/link-child', { childEmail });
      setLinked(true);
      addNotification('Profile Linked!', `Connected to ${childEmail}`, 'success');
      await fetchStudents();
    } catch (err: any) {
      setLinkError(err.response?.data?.error || 'No student found with that email.');
    } finally { setLinking(false); }
  };

  const trendData = child?.metricsHistory ? child.metricsHistory.map((m: any) => ({
    name: m.date, Pace: m.wpm || 70, Focus: m.focusScore || 88
  })) : [
    { name: 'Mon', Pace: 66, Focus: 80 },
    { name: 'Tue', Pace: 70, Focus: 83 },
    { name: 'Wed', Pace: 74, Focus: 87 },
    { name: 'Thu', Pace: 78, Focus: 90 },
    { name: 'Fri', Pace: 83, Focus: 94 },
  ];

  const atHomeGuides = [
    { icon: BookOpen, title: 'Phonics Reading Practice', desc: 'Spend 15 minutes reading aloud together using rhyming books. Pause and discuss unfamiliar words.', color: '#3b82f6', tag: 'Daily' },
    { icon: Eye, title: 'Visual Tracking Exercises', desc: 'Use a finger or pencil to guide left-to-right tracking exercises across a structured sentence strip.', color: '#22d3ee', tag: '3× weekly' },
    { icon: Brain, title: 'Memory Card Matching', desc: 'Play word-to-image matching memory games to reinforce sight word recognition in a fun context.', color: '#8b5cf6', tag: 'Weekly' },
    { icon: Lightbulb, title: 'Break & Movement Intervals', desc: 'Use a 5-minute movement break every 20 minutes to reset attention — great for ADHD-marker mitigation.', color: '#10b981', tag: 'Every session' },
  ];

  const riskInterpretation = (risk: string) => {
    if (risk === 'LOW') return { label: 'Great news — low risk detected.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (risk === 'MEDIUM') return { label: 'Some patterns noted — monitoring recommended.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'Important — consider a specialist consultation.', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  };

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <div className="gradient-orb gradient-orb-cyan w-96 h-96 top-0 left-0 opacity-8" />
      <div className="gradient-orb gradient-orb-emerald w-80 h-80 bottom-0 right-0 opacity-6" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-6 relative z-10">

        {/* ══ HEADER ════════════════════════════════════ */}
        <motion.div {...fadeUp(0)} className="neo-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-emerald-500/4 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-pink-400 font-semibold tracking-wider uppercase">Family Portal</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-black">
                Welcome, <span className="gradient-text-blue">{user?.name?.split(' ')[0] || 'Parent'}.</span>
              </h1>
              <p className="text-slate-400 mt-1 max-w-lg">Your child's learning journey at a glance — plain-language insights and actionable home activity guides.</p>
            </div>
            {child && (
              <div className="flex items-center gap-3 glass-panel rounded-2xl px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  {child.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{child.name}</p>
                  <p className="text-xs text-slate-500">{child.grade} · Last tested: {child.lastTested || 'Recently'}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold">LINKED</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {!child ? (
          /* ── Link Child CTA ── */
          <motion.div {...fadeUp(0.05)} className="neo-card rounded-3xl p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto">
              <Link2 className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold">Connect Your Child's Profile</h3>
              <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm leading-relaxed">
                Enter the email address your child used to register on NeuroLearn to link their cognitive analytics to your parent portal.
              </p>
            </div>
            <form onSubmit={handleLink} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email" value={childEmail} onChange={e => setChildEmail(e.target.value)}
                  placeholder="child@school.edu"
                  className="w-full bg-cosmos-800 border border-cosmos-500 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>
              <button type="submit" disabled={linking}
                className="premium-btn-primary px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50">
                {linking ? 'Linking...' : 'Link Profile'}
              </button>
            </form>
            {linkError && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">{linkError}</p>}
          </motion.div>
        ) : (
          <>
            {/* ══ CHILD STATS ROW ═══════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Focus Score', val: `${child.focusScore || 88}%`, color: '#3b82f6', icon: Target },
                { label: 'Day Streak', val: `${child.streakDays || 5} days`, color: '#f97316', icon: Flame },
                { label: 'Tests Done', val: `${child.completedTests?.length || 1}`, color: '#10b981', icon: CheckCircle },
                { label: 'Last Screened', val: child.lastTested || 'Yesterday', color: '#8b5cf6', icon: Calendar },
              ].map(({ label, val, color, icon: Icon }, i) => (
                <motion.div key={label} {...fadeUp(0.05 + i * 0.04)} className="neo-card rounded-2xl p-4 space-y-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color }} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
                    <div className="text-xl font-black font-mono-data mt-0.5" style={{ color }}>{val}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ══ MAIN CONTENT ══════════════════════════ */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Growth Chart */}
              <motion.div {...fadeUp(0.1)} className="neo-card rounded-3xl p-6 space-y-4">
                <div>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Weekly Progress</div>
                  <h3 className="font-display font-bold text-lg">Learning Growth Curve</h3>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="focusCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="paceBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,36,72,0.5)" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} domain={[50, 100]} />
                      <Tooltip contentStyle={{ background: '#0c1228', border: '1px solid rgba(34,211,238,0.15)', borderRadius: '12px', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="Focus" stroke="#22d3ee" strokeWidth={2.5} fill="url(#focusCyan)" name="Focus %" />
                      <Area type="monotone" dataKey="Pace" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="url(#paceBlue)" name="Reading Pace" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Focus Score</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-px border-t-2 border-dashed border-blue-400 inline-block" /> Reading Pace</span>
                </div>
              </motion.div>

              {/* AI Summary */}
              <motion.div {...fadeUp(0.12)} className="neo-card rounded-3xl p-6 space-y-4">
                <div>
                  <div className="text-[10px] text-violet-400 uppercase tracking-widest font-bold">AI Interpretation</div>
                  <h3 className="font-display font-bold text-lg">What the AI Found</h3>
                </div>

                {report ? (
                  <div className="space-y-3">
                    {[
                      { label: 'Dyslexia Screening', val: `${report.dyslexiaProb}% probability`, risk: report.dyslexiaRisk },
                      { label: 'Attention (ADHD) Markers', val: `${report.adhdProb}% probability`, risk: report.adhdRisk },
                      { label: 'Cognitive Stress', val: report.cognitiveStress, risk: report.cognitiveStress === 'LOW' ? 'LOW' : 'MEDIUM' },
                    ].map(({ label, val, risk }) => {
                      const interp = riskInterpretation(risk);
                      return (
                        <div key={label} className={`rounded-xl p-3.5 border ${interp.bg} ${interp.border}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-300">{label}</span>
                            <span className="text-xs font-mono-data font-bold text-slate-400">{val}</span>
                          </div>
                          <p className={`text-[11px] ${interp.color} font-medium`}>{interp.label}</p>
                        </div>
                      );
                    })}

                    {report.teacherNotes && (
                      <div className="bg-cosmos-700/40 rounded-xl p-3.5 border border-cosmos-500">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Teacher's Note</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{report.teacherNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                    <Activity className="w-8 h-8 text-slate-600" />
                    <p className="text-sm text-slate-500">No AI report generated yet. Complete a screening test to see results.</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ══ AT-HOME GUIDES ════════════════════════ */}
            <motion.div {...fadeUp(0.16)} className="neo-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Home Support</div>
                  <h3 className="font-display font-bold text-lg">Activity Guides for You</h3>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {atHomeGuides.map(({ icon: Icon, title, desc, color, tag }) => (
                  <motion.div
                    key={title}
                    className="flex gap-4 p-4 rounded-2xl bg-cosmos-700/30 border border-cosmos-600 hover:border-cosmos-500 transition-all group"
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-cosmos-600 text-slate-500 uppercase">{tag}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Badges showcase */}
            {child.badges && child.badges.length > 0 && (
              <motion.div {...fadeUp(0.2)} className="neo-card rounded-3xl p-6 space-y-4">
                <div>
                  <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Achievements</div>
                  <h3 className="font-display font-bold text-lg">{child.name?.split(' ')[0]}'s Badges</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {child.badges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/8 border border-amber-500/15">
                      <span className="text-lg">{badge.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{badge.name}</p>
                        <p className="text-[9px] text-slate-600">{badge.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentPortal;
