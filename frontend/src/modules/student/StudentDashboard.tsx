import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { VoiceModule } from '../ai/VoiceModule';
import { TypingModule } from '../ai/TypingModule';
import { EyeTrackingModule } from '../ai/EyeTrackingModule';
import { useCountUp } from '../../hooks/useCountUp';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import {
  Brain, Eye, Mic, Keyboard, Award, Flame, Sparkles, Play,
  ArrowRight, ChevronRight, CheckCircle2, TrendingUp, AlertCircle, Zap,
  BookOpen, Activity, Shield, Star, X, BarChart3, Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
});

// ─── Animated Score Ring ────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; color: string; size?: number; label?: string }> = ({
  score, color, size = 100, label
}) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(26,36,72,0.8)" strokeWidth="8" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      {/* Centered label */}
      <div className="text-center -mt-2">
        <div className="text-2xl font-black font-mono-data" style={{ color }}>{score}%</div>
        {label && <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>}
      </div>
    </div>
  );
};

// ─── Confidence Bar ─────────────────────────────────────────────────────────
const ConfidenceBar: React.FC<{ label: string; value: number; color: string; risk: string; riskColor: string }> = ({
  label, value, color, risk, riskColor
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono-data text-slate-300 font-bold">{value}%</span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${riskColor}`}>{risk}</span>
      </div>
    </div>
    <div className="progress-bar-track h-2">
      <motion.div
        className="progress-bar-fill h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
        initial={{ width: '0%' }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
      />
    </div>
  </div>
);

export const StudentDashboard: React.FC = () => {
  const { students, readingTests, aiReports, user, addNotification, fetchStudents, fetchReadingTests, fetchReports } = useStore();

  const student = students.find(s => s.email === user?.email) || students[0];
  const activeReport = aiReports.find(r => r.studentId === student?.id) || aiReports[0];

  useEffect(() => { fetchStudents(); fetchReadingTests(); }, []);
  useEffect(() => { if (student?.id) fetchReports(student.id); }, [student?.id]);

  const [activeScreening, setActiveScreening] = useState<{ type: 'voice' | 'typing' | 'eye'; testId: string } | null>(null);

  const animatedFocus = useCountUp(student?.focusScore || 92);
  const animatedStreak = useCountUp(student?.streakDays || 5);

  const triggerConfetti = (name: string) => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#8b5cf6', '#22d3ee'] });
    addNotification('🏆 Badge Unlocked!', `You earned "${name}"`, 'success');
  };

  // Radar data
  const radarData = [
    { subject: 'Focus', A: activeReport?.attentionSpanMin ? Math.min(100, activeReport.attentionSpanMin * 7) : 88 },
    { subject: 'Speech', A: activeReport?.speechFluencyScore || 92 },
    { subject: 'Typing', A: activeReport?.typingRhythmConsistency || 85 },
    { subject: 'Gaze', A: activeReport?.dyslexiaProb ? 100 - activeReport.dyslexiaProb : 88 },
    { subject: 'Memory', A: 78 },
    { subject: 'Pace', A: 82 },
  ];

  // Timeline data
  const timeline = student?.metricsHistory || [
    { date: 'Mon', focusScore: 80, wpm: 68, readingSpeed: 68 },
    { date: 'Tue', focusScore: 83, wpm: 72, readingSpeed: 72 },
    { date: 'Wed', focusScore: 87, wpm: 75, readingSpeed: 75 },
    { date: 'Thu', focusScore: 85, wpm: 78, readingSpeed: 78 },
    { date: 'Fri', focusScore: 91, wpm: 82, readingSpeed: 82 },
    { date: 'Sat', focusScore: 94, wpm: 86, readingSpeed: 86 },
  ];

  const modalityCards = [
    { type: 'voice' as const, icon: Mic, label: 'Voice Analysis', subtitle: 'Whisper Speech NLP', color: '#8b5cf6', bg: 'bg-violet-500/10', border: 'border-violet-500/20', desc: 'Record yourself reading aloud. AI analyzes phoneme hesitations and speech fluency in real-time.' },
    { type: 'typing' as const, icon: Keyboard, label: 'Keystroke Dynamics', subtitle: 'Typing Rhythm AI', color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Type a structured passage. Microsecond analysis of dwell times and letter confusion patterns.' },
    { type: 'eye' as const, icon: Eye, label: 'Eye Tracking', subtitle: 'MediaPipe Gaze AI', color: '#22d3ee', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Enable webcam. AI maps your gaze deviation and blink patterns against reading passages.' },
  ];

  if (activeScreening) {
    const card = modalityCards.find(c => c.type === activeScreening.type)!;
    return (
      <div className="min-h-screen aurora-bg p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setActiveScreening(null)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            ← Back to Dashboard
          </button>
          {activeScreening.type === 'voice' && <VoiceModule testId={activeScreening.testId} onComplete={() => setActiveScreening(null)} />}
          {activeScreening.type === 'typing' && <TypingModule testId={activeScreening.testId} onComplete={() => setActiveScreening(null)} />}
          {activeScreening.type === 'eye' && <EyeTrackingModule testId={activeScreening.testId} onComplete={() => setActiveScreening(null)} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg pb-20">
      {/* ── Background ── */}
      <div className="gradient-orb gradient-orb-blue w-96 h-96 top-0 right-0 opacity-10" />
      <div className="gradient-orb gradient-orb-violet w-80 h-80 bottom-1/3 left-0 opacity-8" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 relative z-10">

        {/* ══ HERO GREETING BANNER ══════════════════════ */}
        <motion.div {...fadeUp(0)} className="neo-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/6 via-transparent to-violet-500/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">AI Engine Active</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white">
                Good morning, <span className="gradient-text-blue">{student?.name?.split(' ')[0] || 'Student'}.</span>
              </h1>
              <p className="text-slate-400 text-base max-w-lg">
                Your cognitive performance is tracking <span className="text-emerald-400 font-semibold">well above baseline</span>. Three modalities ready for screening.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-cosmos-700/50 px-3 py-1.5 rounded-full border border-cosmos-500">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> {animatedStreak}-Day Streak
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-cosmos-700/50 px-3 py-1.5 rounded-full border border-cosmos-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {student?.completedTests?.length || 1} Tests Complete
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-cosmos-700/50 px-3 py-1.5 rounded-full border border-cosmos-500">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> {student?.grade || 'Grade 4'}
                </div>
              </div>
            </div>

            {/* Focus Score Ring */}
            <div className="flex items-center gap-6">
              <div className="text-center space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Focus Score</div>
                <div className="relative">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(26,36,72,0.8)" strokeWidth="8" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#3b82f6"
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={263.9}
                      initial={{ strokeDashoffset: 263.9 }}
                      animate={{ strokeDashoffset: 263.9 - (animatedFocus / 100) * 263.9 }}
                      transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
                      style={{ filter: 'drop-shadow(0 0 8px #3b82f680)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center rotate-90">
                    <div className="text-center">
                      <div className="text-xl font-black font-mono-data text-blue-400">{animatedFocus}</div>
                      <div className="text-[8px] text-slate-600 uppercase">%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Dyslexia Risk', val: `${activeReport?.dyslexiaProb || 15}%`, color: 'text-emerald-400', risk: activeReport?.dyslexiaRisk || 'LOW' },
                  { label: 'ADHD Marker', val: `${activeReport?.adhdProb || 12}%`, color: 'text-emerald-400', risk: activeReport?.adhdRisk || 'LOW' },
                  { label: 'Cog. Stress', val: activeReport?.cognitiveStress || 'LOW', color: 'text-emerald-400', risk: '' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-500">{m.label}</span>
                    <span className={`font-bold font-mono-data ${m.color}`}>{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══ MAIN GRID ════════════════════════════════ */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* LEFT — Radar + Timeline */}
          <div className="lg:col-span-8 space-y-6">

            {/* Cognitive Radar */}
            <motion.div {...fadeUp(0.05)} className="neo-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-0.5">Multi-Modal Profile</div>
                  <h3 className="font-display font-bold text-lg">Cognitive Radar Analysis</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                  <Activity className="w-3 h-3" /> Live
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="rgba(26,36,72,0.8)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="A" stroke="#3b82f6" strokeWidth={2}
                      fill="#3b82f6" fillOpacity={0.12} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Performance Timeline */}
            <motion.div {...fadeUp(0.1)} className="neo-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-violet-400 uppercase tracking-widest font-bold mb-0.5">7-Day Trend</div>
                  <h3 className="font-display font-bold text-lg">Learning Performance Timeline</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Focus</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> WPM</span>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,36,72,0.6)" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} fontWeight={600} />
                    <YAxis stroke="#475569" fontSize={10} domain={[50, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#0c1228', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', fontSize: '11px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="focusScore" stroke="#3b82f6" strokeWidth={2.5} fill="url(#focusGrad)" name="Focus %" />
                    <Area type="monotone" dataKey="wpm" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" fill="url(#wpmGrad)" name="WPM" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* AI Screening Lab */}
            <motion.div {...fadeUp(0.15)} className="neo-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-0.5">AI Lab</div>
                  <h3 className="font-display font-bold text-lg">Screening Modules</h3>
                </div>
                <span className="text-[10px] text-slate-500 bg-cosmos-700 px-2 py-1 rounded-lg border border-cosmos-500">
                  {readingTests.length} Tests Available
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {modalityCards.map(({ type, icon: Icon, label, subtitle, color, bg, border, desc }) => (
                  <motion.div
                    key={type}
                    className={`relative rounded-2xl p-5 ${bg} border ${border} cursor-pointer group overflow-hidden`}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    onClick={() => setActiveScreening({ type, testId: readingTests[0]?.id || 'test-1' })}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }} />
                    <div className="relative z-10 space-y-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-200">{label}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
                      <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color }}>
                        Begin Test <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Report + Badges + Recommendations */}
          <div className="lg:col-span-4 space-y-6">

            {/* AI Risk Report Card */}
            <motion.div {...fadeUp(0.08)} className="neo-card rounded-3xl p-5 space-y-4">
              <div>
                <div className="text-[10px] text-violet-400 uppercase tracking-widest font-bold mb-0.5">Latest Report</div>
                <h3 className="font-display font-bold text-base">AI Risk Profile</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{activeReport?.date || 'May 30, 2026'}</p>
              </div>

              <div className="space-y-3 pt-1">
                <ConfidenceBar
                  label="Dyslexia Risk"
                  value={activeReport?.dyslexiaProb || 15}
                  color="#3b82f6"
                  risk={activeReport?.dyslexiaRisk || 'LOW'}
                  riskColor="risk-badge-low"
                />
                <ConfidenceBar
                  label="ADHD Markers"
                  value={activeReport?.adhdProb || 12}
                  color="#8b5cf6"
                  risk={activeReport?.adhdRisk || 'LOW'}
                  riskColor="risk-badge-low"
                />
                <ConfidenceBar
                  label="Speech Fluency"
                  value={activeReport?.speechFluencyScore || 92}
                  color="#22d3ee"
                  risk="HIGH"
                  riskColor="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                />
                <ConfidenceBar
                  label="Typing Rhythm"
                  value={activeReport?.typingRhythmConsistency || 88}
                  color="#10b981"
                  risk="STRONG"
                  riskColor="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                />
              </div>

              {activeReport?.recommendations && activeReport.recommendations.length > 0 && (
                <div className="pt-2 border-t border-cosmos-600">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">AI Recommendations</p>
                  <div className="space-y-1.5">
                    {activeReport.recommendations.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <Sparkles className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Achievement Badges */}
            <motion.div {...fadeUp(0.12)} className="neo-card rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-0.5">Achievements</div>
                  <h3 className="font-display font-bold text-base">Badge Galaxy</h3>
                </div>
                <Star className="w-4 h-4 text-amber-400 fill-current" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(student?.badges || [
                  { id: 'b1', name: 'Focus Champion', icon: '🏆', date: 'May 28' },
                  { id: 'b2', name: 'Speech Master', icon: '🎙', date: 'May 29' },
                ]).map(badge => (
                  <motion.button
                    key={badge.id}
                    onClick={() => triggerConfetti(badge.name)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cosmos-700/40 border border-cosmos-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-200 leading-tight">{badge.name}</p>
                      <p className="text-[9px] text-slate-600 mt-0.5">{badge.date}</p>
                    </div>
                  </motion.button>
                ))}
                {/* Locked badges */}
                {[{ name: 'Eye Master', icon: '👁' }, { name: 'Speed Typer', icon: '⌨' }].map(b => (
                  <div key={b.name} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cosmos-800/30 border border-cosmos-700 opacity-40">
                    <span className="text-xl grayscale">{b.icon}</span>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 leading-tight">{b.name}</p>
                      <p className="text-[9px] text-slate-600">Locked</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div {...fadeUp(0.16)} className="neo-card rounded-3xl p-5 space-y-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Quick Stats</div>
              {[
                { icon: Target, label: 'Attention Span', val: `${activeReport?.attentionSpanMin || 15} min`, color: 'text-blue-400' },
                { icon: Brain, label: 'Cognitive Stress', val: activeReport?.cognitiveStress || 'LOW', color: 'text-emerald-400' },
                { icon: Zap, label: 'Last Screened', val: student?.lastTested || 'Yesterday', color: 'text-violet-400' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-cosmos-700 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <span className={`text-xs font-bold font-mono-data ${color}`}>{val}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
