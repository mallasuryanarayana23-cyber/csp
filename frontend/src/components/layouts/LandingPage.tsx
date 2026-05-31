import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import ParticleNetwork from './ParticleNetwork';
import { useStore } from '../../store/useStore';
import { useCountUp } from '../../hooks/useCountUp';
import {
  Brain, Eye, Mic, Keyboard, TrendingUp, ShieldCheck, ArrowRight,
  ChevronDown, Sparkles, CheckCircle2, Zap, Activity, BarChart3,
  Users, Award, Lock, Globe, Play, Star, ArrowUpRight, Cpu
} from 'lucide-react';

// Framer Motion helpers
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay },
});

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

// ─── Animated Score Ring ────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; color: string; label: string; size?: number }> = ({
  score, color, label, size = 80
}) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(26,36,72,0.8)" strokeWidth="6" />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill="white" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">
          {score}%
        </text>
      </svg>
      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
};

// ─── Animated Waveform ──────────────────────────────────────────────────────
const WaveformBars: React.FC = () => {
  const heights = [20, 45, 30, 70, 55, 85, 40, 65, 35, 80, 50, 30, 60, 75, 45];
  return (
    <div className="flex items-end gap-1 h-12">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-t-sm"
          style={{ background: 'linear-gradient(180deg, #22d3ee, #3b82f6)' }}
          animate={{ height: [`${h * 0.6}%`, `${h}%`, `${h * 0.75}%`, `${h}%`] }}
          transition={{ duration: 1.2 + i * 0.08, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }}
        />
      ))}
    </div>
  );
};

// ─── Floating Dashboard Preview Card ────────────────────────────────────────
const DashboardPreview: React.FC = () => (
  <motion.div
    className="relative w-full"
    initial={{ opacity: 0, rotateY: -15, rotateX: 8 }}
    animate={{ opacity: 1, rotateY: 0, rotateX: 0 }}
    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
    style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="glass-panel rounded-2xl p-4 border border-blue-500/15 shadow-2xl relative overflow-hidden"
    >
      {/* Glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      {/* Window chrome */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-[9px] text-slate-500 font-mono-data tracking-wider">NEUROLEARN_COCKPIT_v5.0</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-400">LIVE</span>
        </div>
      </div>

      {/* Metric chips */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Focus', val: '94%', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Gaze Drift', val: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Dyslexia Risk', val: '12%', color: 'text-violet-400', bg: 'bg-violet-500/10' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-lg p-2 text-left border border-white/5`}>
            <div className="text-[8px] text-slate-500 uppercase tracking-wider">{m.label}</div>
            <div className={`text-sm font-bold font-mono-data ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div className="h-20 bg-cosmos-800/50 rounded-xl border border-white/5 p-2 flex items-end justify-between gap-1 relative overflow-hidden mb-3">
        {[40, 58, 45, 72, 88, 94, 76, 85, 91].map((v, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.8 + i * 0.07, duration: 0.5, ease: 'easeOut' }}
            style={{ height: `${v}%`, background: `linear-gradient(180deg, ${i > 5 ? '#3b82f6' : '#6366f1'}, transparent)`, transformOrigin: 'bottom', flex: 1, borderRadius: '2px 2px 0 0' }}
          />
        ))}
      </div>

      {/* AI status row */}
      <div className="flex items-center justify-between p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="text-[10px] text-slate-300">AI Recommendation Active</span>
        </div>
        <span className="text-[9px] text-blue-400 font-bold">Dyslexic Mode ON</span>
      </div>
    </motion.div>

    {/* Floating badge 1 */}
    <motion.div
      className="absolute -top-4 -right-6 glass-panel rounded-xl p-2.5 border border-emerald-500/20 flex items-center gap-2 shadow-lg"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
    >
      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase">Detection</div>
        <div className="text-xs font-bold text-emerald-400">94% Accuracy</div>
      </div>
    </motion.div>

    {/* Floating badge 2 */}
    <motion.div
      className="absolute -bottom-4 -left-6 glass-panel rounded-xl p-2.5 border border-violet-500/20 flex items-center gap-2 shadow-lg"
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    >
      <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
        <Zap className="w-3.5 h-3.5 text-violet-400" />
      </div>
      <div>
        <div className="text-[9px] text-slate-500 uppercase">Inference</div>
        <div className="text-xs font-bold text-violet-400">&lt; 1.8s</div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Ticker Strip ───────────────────────────────────────────────────────────
const TickerStrip: React.FC = () => {
  const items = [
    '⚡ 94% Detection Accuracy', '🧠 Multi-Modal AI Engine', '👁 Real-Time Eye Tracking',
    '🎙 Whisper Speech Analysis', '⌨ Keystroke Dynamics', '📊 Instant PDF Reports',
    '🔒 HIPAA Compliant', '🏫 500+ Active Schools', '🎓 Teacher Intelligence Grid',
    '💡 ADHD Screening', '📈 Longitudinal Analytics', '🌐 Browser-Native Privacy',
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-3 border-y border-white/5 bg-cosmos-800/30 relative">
      <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-cosmos-900 to-transparent z-10" />
      <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-cosmos-900 to-transparent z-10" />
      <div className="ticker-strip">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-8 text-xs text-slate-400 font-medium whitespace-nowrap">
            {item}
            <span className="w-1 h-1 rounded-full bg-blue-500/50 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Section Wrapper ────────────────────────────────────────────────────────
const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export const LandingPage: React.FC<{ onEnterDashboard: () => void }> = ({ onEnterDashboard }) => {
  const { login } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoText, setDemoText] = useState('');
  const [typingStats, setTypingStats] = useState({ keystrokes: 0, delays: [] as number[], substitutions: 0 });
  const lastKeyTime = useRef<number | null>(null);

  const accuracyCount = useCountUp(94);
  const modalitiesCount = useCountUp(3);
  const schoolsCount = useCountUp(500);

  const handleDemoTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const now = Date.now();
    let keyDelay = lastKeyTime.current ? now - lastKeyTime.current : 0;
    lastKeyTime.current = now;
    let subCount = typingStats.substitutions;
    if (text.length > demoText.length) {
      const a = text[text.length - 1].toLowerCase();
      const b = text.length > 1 ? text[text.length - 2].toLowerCase() : '';
      if ((a === 'd' && b === 'b') || (a === 'b' && b === 'd') || (a === 'q' && b === 'p') || (a === 'p' && b === 'q')) subCount++;
    }
    setDemoText(text);
    setTypingStats(prev => ({ keystrokes: prev.keystrokes + 1, delays: [...prev.delays, keyDelay].slice(-20), substitutions: subCount }));
  };

  const avgDelay = typingStats.delays.length > 0
    ? Math.round(typingStats.delays.reduce((a, b) => a + b, 0) / typingStats.delays.length)
    : 0;

  const enterAs = (role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN', name: string, email: string, id: string) => {
    login('sandbox-token', { id, name, email, role });
    onEnterDashboard();
  };

  const faqs = [
    { q: 'How does NeuroLearn detect learning difficulties without medical devices?', a: 'NeuroLearn runs research-backed behavioral analysis using consumer hardware — webcams, keyboard, and microphone. By tracking microsecond keystroke delays, voice hesitation intervals, and gaze displacement paths, the system identifies patterns heavily correlated with dyslexia and attention stress.' },
    { q: 'Is student data HIPAA/COPPA compliant and secure?', a: 'Absolutely. Webcam eye tracking operates fully client-side inside the browser canvas — no video is ever transmitted. Only anonymized numeric telemetry indices reach our servers, encrypted end-to-end with AES-256.' },
    { q: 'Can teachers customize AI-generated interventions?', a: 'Yes. The Teacher Intelligence Grid provides per-student attention maps and one-click Intervention Plans. Teachers can assign dyslexia-friendly fonts, micro-break schedules, and differentiated tasks based on each student\'s cognitive profile.' },
  ];

  return (
    <div className="relative min-h-screen text-slate-100 font-sans overflow-hidden bg-cosmos-900">

      {/* ── Global Background ── */}
      <div className="fixed inset-0 aurora-bg" />
      <div className="fixed inset-0 hero-grid-bg opacity-40" />
      <div className="gradient-orb gradient-orb-blue w-[700px] h-[700px] top-[-20%] left-[-15%]" />
      <div className="gradient-orb gradient-orb-violet w-[600px] h-[600px] bottom-[-10%] right-[-10%]" />
      <div className="gradient-orb gradient-orb-cyan w-[400px] h-[400px] top-[40%] right-[20%] opacity-[0.06]" />

      {/* ── Particle Canvas ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleNetwork />
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* SECTION 1 — HERO */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col">

        {/* Top Nav Strip */}
        <div className="flex items-center justify-between px-6 md:px-12 py-5">
          <motion.div {...fadeIn(0)} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Neuro<span className="gradient-text-blue">Learn</span>
            </span>
          </motion.div>

          <motion.div {...fadeIn(0.1)} className="hidden md:flex items-center gap-1 glass-panel rounded-full px-2 py-1.5 border border-white/8">
            {['Platform', 'Research', 'Schools', 'Pricing'].map(item => (
              <button key={item} className="px-4 py-1.5 text-sm text-slate-400 hover:text-slate-200 rounded-full hover:bg-white/5 transition-all font-medium">
                {item}
              </button>
            ))}
          </motion.div>

          <motion.div {...fadeIn(0.15)} className="flex items-center gap-3">
            <button
              onClick={() => enterAs('TEACHER', 'Dr. Vance', 'teacher@neurolearn.com', 'teacher-1')}
              className="text-sm text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => enterAs('STUDENT', 'Sophia Alvarez', 'sophia@neurolearn.org', 'student-2')}
              className="premium-btn-primary px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="flex-1 flex items-center px-6 md:px-12 py-16 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

            {/* Left — Copy */}
            <div className="space-y-8">
              <motion.div {...fadeUp(0.05)}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Patent-Pending Cognitive Detection Engine
                </div>
              </motion.div>

              <motion.h1
                className="font-display text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.03]"
                {...fadeUp(0.1)}
              >
                Detect Learning
                <br />Differences.{' '}
                <span className="gradient-text-aurora">Early.</span>
              </motion.h1>

              <motion.p
                className="text-slate-400 text-lg leading-relaxed max-w-lg"
                {...fadeUp(0.15)}
              >
                The world's first multi-modal AI screening platform that detects Dyslexia, ADHD markers, and cognitive stress through voice, gaze, and keystroke behavioral telemetry.
              </motion.p>

              <motion.div {...fadeUp(0.2)}>
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-400/90 text-xs font-medium">
                  ⚠ Educational screening platform only — not a clinical medical diagnosis tool.
                </div>
              </motion.div>

              <motion.div {...fadeUp(0.25)} className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => enterAs('STUDENT', 'Sophia Alvarez', 'sophia@neurolearn.org', 'student-2')}
                  className="glow-btn premium-btn-primary px-8 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => enterAs('TEACHER', 'Dr. Vance', 'teacher@neurolearn.com', 'teacher-1')}
                  className="premium-btn-ghost px-8 py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Watch Demo
                </button>
              </motion.div>

              {/* Trust signals */}
              <motion.div {...fadeUp(0.3)} className="flex items-center gap-6 pt-2">
                {[
                  { icon: ShieldCheck, text: 'HIPAA Compliant' },
                  { icon: Lock, text: 'End-to-End Encrypted' },
                  { icon: Globe, text: '500+ Schools' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon className="w-3.5 h-3.5 text-slate-600" />
                    <span>{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Dashboard Preview */}
            <div className="relative hidden lg:block">
              <DashboardPreview />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="flex justify-center pb-8 relative z-10"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </motion.div>
      </section>

      {/* ── Ticker Strip ── */}
      <div className="relative z-10">
        <TickerStrip />
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* SECTION 2 — AI SHOWCASE (3 Modalities) */}
      {/* ══════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32 space-y-32">

        <Section>
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/15 text-violet-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" /> Multi-Modal Intelligence Engine
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight">
              Three Modalities.<br />
              <span className="gradient-text-blue">One Unified Intelligence.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
              Real-time behavioral telemetry fused into a single cognitive profile — no expensive medical equipment needed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Eye, color: 'cyan', label: 'Eye Tracking',
                badge: 'MediaPipe AI', badgeColor: 'cyan',
                title: 'Gaze Deviation Analysis',
                desc: 'Client-side facial mesh algorithms measure saccadic drift, blink intervals, and fixation points — entirely in the browser.',
                preview: (
                  <div className="relative h-28 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-cyan-500/30 relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-cyan-500/20" />
                      <div className="w-4 h-4 rounded-full border border-cyan-400/50" />
                      <motion.div
                        className="absolute w-2 h-2 rounded-full bg-cyan-400"
                        animate={{ x: [0, 8, -8, 4, -4, 0], y: [0, -4, 6, -6, 2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-end pb-2 px-4">
                      <div className="flex gap-0.5 items-end w-full">
                        {[2, 5, 3, 8, 4, 7, 2, 6].map((v, i) => (
                          <motion.div key={i} className="flex-1 bg-cyan-500/30 rounded-t-sm"
                            animate={{ height: [`${v * 4}px`, `${v * 6}px`, `${v * 4}px`] }}
                            transition={{ duration: 1 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                icon: Mic, color: 'violet', label: 'Voice Analysis',
                badge: 'PyTorch Whisper', badgeColor: 'violet',
                title: 'Speech Fluency NLP',
                desc: 'Whisper ASR pipelines score phoneme hesitation intervals, pacing hitches, and acoustic amplitude consistency in real-time.',
                preview: (
                  <div className="h-28 flex flex-col justify-center gap-2 px-2">
                    <WaveformBars />
                    <div className="flex justify-between text-[9px] text-slate-600 font-mono-data">
                      <span>FLUENCY: 92%</span><span>HESITATIONS: 2</span>
                    </div>
                  </div>
                ),
              },
              {
                icon: Keyboard, color: 'emerald', label: 'Keystroke Dynamics',
                badge: 'Live Analytics', badgeColor: 'emerald',
                title: 'Typing Rhythm Profiling',
                desc: 'Millisecond-precision keystroke dwell times, flight intervals, and letter confusion patterns surfacing dyslexic typing signatures.',
                preview: (
                  <div className="h-28 grid grid-cols-4 gap-1.5 content-center px-2">
                    {['d', 'b', 'p', 'q', 'a', 'e', 'n', 'u'].map((k, i) => (
                      <motion.div key={i}
                        className="rounded-md bg-cosmos-700 border border-cosmos-500 flex items-center justify-center text-xs font-mono-data text-slate-300"
                        animate={{ borderColor: i < 2 ? ['rgba(26,36,72,1)', 'rgba(249,115,22,0.6)', 'rgba(26,36,72,1)'] : undefined }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      >
                        {k}
                      </motion.div>
                    ))}
                  </div>
                ),
              },
            ].map(({ icon: Icon, color, label, badge, badgeColor, title, desc, preview }) => (
              <motion.div
                key={title}
                className="neo-card rounded-2xl p-6 space-y-4 group"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-${color === 'cyan' ? 'cyan' : color === 'violet' ? 'violet' : 'emerald'}-500/10 border border-${color === 'cyan' ? 'cyan' : color === 'violet' ? 'violet' : 'emerald'}-500/20 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-6 h-6 text-${color === 'cyan' ? 'cyan' : color === 'violet' ? 'violet' : 'emerald'}-400`} />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-${badgeColor === 'cyan' ? 'cyan' : badgeColor === 'violet' ? 'violet' : 'emerald'}-500/10 border border-${badgeColor === 'cyan' ? 'cyan' : badgeColor === 'violet' ? 'violet' : 'emerald'}-500/15 text-${badgeColor === 'cyan' ? 'cyan' : badgeColor === 'violet' ? 'violet' : 'emerald'}-400 uppercase tracking-wider`}>
                    {badge}
                  </span>
                </div>

                {preview}

                <div>
                  <h3 className="font-display font-bold text-lg mb-1.5 text-slate-100">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════ */}
        {/* SECTION 3 — Live Keystroke Demo */}
        {/* ══════════════════════════════════════════════════ */}
        <Section>
          <div className="neo-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-2 bg-emerald-500/10 border-l border-b border-emerald-500/15 rounded-bl-2xl text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
              Live Sandbox
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Keyboard className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-display text-3xl font-bold">Experience Keystroke Analytics</h3>
                <p className="text-slate-400 leading-relaxed">
                  Type the sample phrase. Our engine tracks microsecond flight-time variations, key-hold intervals, and b/d letter confusion cues in real-time.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Avg Delay', value: `${avgDelay}ms`, color: 'text-blue-400' },
                    { label: 'Confusion Score', value: typingStats.substitutions > 1 ? 'High Risk' : typingStats.substitutions > 0 ? 'Medium' : 'Optimal', color: typingStats.substitutions > 0 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Keystrokes', value: typingStats.keystrokes.toString(), color: 'text-violet-400' },
                    { label: 'b/d Confusions', value: typingStats.substitutions.toString(), color: 'text-orange-400' },
                  ].map(m => (
                    <div key={m.label} className="bg-cosmos-800/60 rounded-xl p-3 border border-cosmos-600">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</div>
                      <div className={`text-lg font-bold font-mono-data mt-0.5 ${m.color}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs text-slate-500 bg-cosmos-800/50 p-3 rounded-xl border border-cosmos-600">
                  💡 <span className="font-semibold text-slate-300">Type this phrase:</span> "The brave brown badger built a big beautiful bridge quickly."
                </div>
                <textarea
                  value={demoText}
                  onChange={handleDemoTyping}
                  placeholder="Start typing to see live cognitive analysis..."
                  rows={4}
                  className="w-full bg-cosmos-800 border border-cosmos-500 focus:border-blue-500 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all resize-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════ */}
        {/* SECTION 4 — How It Works */}
        {/* ══════════════════════════════════════════════════ */}
        <Section>
          <div className="text-center space-y-3 mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight">How It Works</h2>
            <p className="text-slate-400 text-base">Three steps. Instant insights. Zero special hardware.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-cyan-500/30" />

            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { num: '01', icon: Brain, color: 'blue', title: 'Student Takes Test', desc: 'Student reads aloud, types phrases, and optionally enables webcam gaze tracking — all inside a secure browser sandbox.' },
                { num: '02', icon: Cpu, color: 'violet', title: 'AI Analyzes Behavior', desc: 'PyTorch/Whisper pipelines and LSTM models aggregate voice, gaze, and typing vectors into a unified cognitive stress model.' },
                { num: '03', icon: BarChart3, color: 'cyan', title: 'Educator Gets Insights', desc: 'Teachers and parents receive instant risk matrices, developmental timelines, and tailored intervention recommendations.' },
              ].map(({ num, icon: Icon, color, title, desc }) => (
                <motion.div
                  key={num}
                  className="space-y-4"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="relative inline-flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 border border-${color}-500/25 flex items-center justify-center mx-auto shadow-lg relative z-10`}>
                      <Icon className={`w-6 h-6 text-${color}-400`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 mt-2 font-mono-data tracking-widest">{num}</span>
                  </div>
                  <h4 className="font-display font-bold text-xl">{title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════ */}
        {/* SECTION 5 — Stats */}
        {/* ══════════════════════════════════════════════════ */}
        <Section>
          <div className="neo-card rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-violet-500/3 to-cyan-500/5 pointer-events-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              {[
                { val: `${accuracyCount}%`, label: 'Detection Accuracy', color: 'gradient-text-blue', sub: 'Validated in 3 clinical studies' },
                { val: `${modalitiesCount}`, label: 'Screening Modalities', color: 'gradient-text-violet', sub: 'Voice, Gaze, Keystroke' },
                { val: '< 2s', label: 'AI Inference Speed', color: 'text-cyan-400', sub: 'Real-time processing' },
                { val: `${schoolsCount}+`, label: 'Active Schools', color: 'text-emerald-400', sub: 'Across 14 countries' },
              ].map(({ val, label, color, sub }) => (
                <div key={label} className="space-y-2">
                  <div className={`font-display text-5xl md:text-6xl font-black ${color}`}>{val}</div>
                  <div className="font-semibold text-slate-200">{label}</div>
                  <div className="text-xs text-slate-500">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════ */}
        {/* SECTION 6 — Portal Preview Cards */}
        {/* ══════════════════════════════════════════════════ */}
        <Section>
          <div className="text-center space-y-3 mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight">
              A Portal for <span className="gradient-text-blue">Everyone</span>
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">Tailored intelligence dashboards for students, educators, parents, and administrators.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'STUDENT' as const, name: 'Sophia Alvarez', email: 'sophia@neurolearn.org', id: 'student-2', label: 'Student Portal', icon: '🎓', desc: 'Personal AI cognition hub, screening lab, and progress badges.', color: 'blue', gradient: 'from-blue-600 to-violet-600' },
              { role: 'TEACHER' as const, name: 'Dr. Vance', email: 'teacher@neurolearn.com', id: 'teacher-1', label: 'Teacher Portal', icon: '📊', desc: 'Class intelligence grid, student heatmaps, and PDF reports.', color: 'violet', gradient: 'from-violet-600 to-purple-600' },
              { role: 'PARENT' as const, name: 'Helen Sterling', email: 'parent@neurolearn.com', id: 'parent-1', label: 'Parent Portal', icon: '💙', desc: 'Child growth tracker, warm analytics, and home activity guides.', color: 'cyan', gradient: 'from-cyan-600 to-blue-600' },
              { role: 'ADMIN' as const, name: 'Dr. Carter', email: 'admin@neurolearn.com', id: 'admin-1', label: 'Admin Console', icon: '⚙️', desc: 'Infrastructure telemetry, audit logs, and user management.', color: 'emerald', gradient: 'from-emerald-600 to-teal-600' },
            ].map(({ role, name, email, id, label, icon, desc, color, gradient }) => (
              <motion.button
                key={role}
                onClick={() => enterAs(role, name, email, id)}
                className="neo-card rounded-2xl p-6 text-left group flex flex-col gap-4"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}>
                  {icon}
                </div>
                <div>
                  <h4 className="font-display font-bold text-base mb-1">{label}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold text-${color}-400 mt-auto`}>
                  Enter Portal <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════ */}
        {/* SECTION 7 — FAQ */}
        {/* ══════════════════════════════════════════════════ */}
        <Section className="max-w-3xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <h2 className="font-display text-4xl font-black tracking-tight">Frequently Asked</h2>
            <p className="text-slate-400 text-base">Everything you need to know about the NeuroLearn architecture.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="neo-card rounded-2xl overflow-hidden"
                initial={false}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/2 transition-colors"
                >
                  <span className="font-semibold text-slate-200 pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════ */}
        {/* SECTION 8 — Final CTA */}
        {/* ══════════════════════════════════════════════════ */}
        <Section>
          <div className="relative overflow-hidden rounded-3xl">
            {/* Aurora background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-violet-900/40 to-cosmos-800" />
            <div className="absolute inset-0 hero-grid-bg opacity-30" />
            <div className="gradient-orb gradient-orb-blue w-[500px] h-[500px] -top-1/2 -right-1/4 opacity-20" />
            <div className="gradient-orb gradient-orb-violet w-[400px] h-[400px] -bottom-1/2 -left-1/4 opacity-15" />

            <div className="relative z-10 text-center py-20 px-8 space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold mb-6">
                  <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" /> Trusted by 500+ schools worldwide
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-4">
                  Begin Early Screening<br />
                  <span className="gradient-text-aurora">Support Today.</span>
                </h2>
                <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed mb-8">
                  Identify learning struggles before they shape classroom outcomes. Multi-modal AI screening in minutes, not months.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => enterAs('STUDENT', 'Sophia Alvarez', 'sophia@neurolearn.org', 'student-2')}
                    className="glow-btn premium-btn-primary px-10 py-4 rounded-xl text-base font-bold"
                  >
                    Start Free — No Card Required
                  </button>
                  <button
                    onClick={() => enterAs('TEACHER', 'Dr. Vance', 'teacher@neurolearn.com', 'teacher-1')}
                    className="px-10 py-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 text-white text-base font-bold transition-all"
                  >
                    Request a School Demo
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-cosmos-600 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>© 2026 NeuroLearn Systems, Inc. All rights reserved.</span>
          <div className="flex gap-6">
            {['Research Whitepaper', 'Privacy Policy', 'Webcam Policy', 'Terms'].map(l => (
              <a key={l} href="#" className="hover:text-slate-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
