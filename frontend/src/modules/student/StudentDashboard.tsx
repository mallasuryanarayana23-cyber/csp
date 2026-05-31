import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { VoiceModule } from '../ai/VoiceModule';
import { TypingModule } from '../ai/TypingModule';
import { EyeTrackingModule } from '../ai/EyeTrackingModule';
import { useCountUp } from '../../hooks/useCountUp';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { 
  Award, 
  Flame, 
  TrendingUp, 
  CheckCircle, 
  BookOpen, 
  Mic, 
  Keyboard, 
  Eye, 
  Sparkles, 
  Play, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentDashboard: React.FC = () => {
  const { 
    students, 
    readingTests, 
    aiReports, 
    user, 
    addNotification, 
    fetchStudents, 
    fetchReadingTests, 
    fetchReports 
  } = useStore();
  
  // Dynamic student & report mapping
  const student = students.find(s => s.email === (user?.email || 'student@neurolearn.com')) || students[0];
  const activeReport = aiReports.find(r => r.studentId === student?.id) || aiReports[0];

  // Fetch live backend seed data on mount
  useEffect(() => {
    fetchStudents();
    fetchReadingTests();
  }, []);

  useEffect(() => {
    if (student?.id) {
      fetchReports(student.id);
    }
  }, [student?.id]);

  // Active modular testing screens state
  const [activeScreening, setActiveScreening] = useState<{ type: 'voice' | 'typing' | 'eye'; testId: string } | null>(null);

  // Animated metric count-ups
  const animatedStreak = useCountUp(student?.streakDays || 5);
  const animatedCompletions = useCountUp(student?.completedTests?.length || 1);
  const animatedFocus = useCountUp(student?.focusScore || 92);
  const animatedRiskProb = useCountUp(activeReport?.dyslexiaProb || 48);

  // Trigger confetti for gamification milestone badges
  const triggerConfetti = (badgeName: string) => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#10b981', '#06b6d4']
    });
    
    addNotification(
      'Milestone Celebration!',
      `You interacted with your "${badgeName}" badge! Keep up the spectacular cognitive practice.`,
      'success'
    );
  };

  // Recharts Radar chart mapper for cognitive profiling
  const radarData = [
    { subject: 'Visual Pacing', value: student && (student as any).metricsHistory ? (student as any).metricsHistory[(student as any).metricsHistory.length - 1]?.readingSpeed || 74 : 74, fullMark: 100 },
    { subject: 'Attention Span', value: student?.focusScore || 92, fullMark: 100 },
    { subject: 'Typing Rhythm', value: activeReport?.typingRhythmConsistency || 74, fullMark: 100 },
    { subject: 'Speech Fluency', value: activeReport?.speechFluencyScore || 82, fullMark: 100 },
    { subject: 'Focus Balance', value: student && (student as any).metricsHistory ? Math.round(100 - ((student as any).metricsHistory[(student as any).metricsHistory.length - 1]?.distractionEvents * 6)) : 88, fullMark: 100 },
  ];

  // Recharts WPM trend longitudinal area chart mapper
  const trendData = student && (student as any).metricsHistory ? (student as any).metricsHistory.map((metric: any) => ({
    name: metric.date,
    WPM: metric.wpm || 70,
    Focus: metric.focusScore || 85
  })) : [
    { name: 'Mon', WPM: 64, Focus: 82 },
    { name: 'Tue', WPM: 70, Focus: 85 },
    { name: 'Wed', WPM: 72, Focus: 88 },
    { name: 'Thu', WPM: 78, Focus: 92 },
    { name: 'Fri', WPM: 82, Focus: 94 }
  ];

  // Try Exercise trigger from recommendations
  const handleTryExercise = (recText: string) => {
    let testType: 'typing' | 'eye' | 'voice' = 'typing';
    
    if (recText.toLowerCase().includes('spacing') || recText.toLowerCase().includes('dyslexia') || recText.toLowerCase().includes('typing')) {
      testType = 'typing';
    } else if (recText.toLowerCase().includes('calibration') || recText.toLowerCase().includes('focus') || recText.toLowerCase().includes('gaze') || recText.toLowerCase().includes('adhd')) {
      testType = 'eye';
    } else {
      testType = 'voice';
    }

    // Find the first assigned test of that category
    const categoryName = testType === 'typing' ? 'Dyslexia Screening' : testType === 'eye' ? 'ADHD Assessment' : 'General Reading';
    const match = readingTests.find(t => t.category === categoryName) || readingTests[0];

    if (match) {
      setActiveScreening({ type: testType, testId: match.id });
      addNotification(
        'Exercise Launched',
        `Launching recommendations workout: "${match.title}"`,
        'info'
      );
    }
  };

  if (activeScreening) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4 px-4">
        {/* Floating return trigger */}
        <button
          onClick={() => setActiveScreening(null)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-indigo-500/10 cursor-pointer transition-colors"
        >
          ← Return to Student Cockpit
        </button>

        {activeScreening.type === 'voice' && (
          <VoiceModule testId={activeScreening.testId} onComplete={() => setActiveScreening(null)} />
        )}
        {activeScreening.type === 'typing' && (
          <TypingModule testId={activeScreening.testId} onComplete={() => setActiveScreening(null)} />
        )}
        {activeScreening.type === 'eye' && (
          <EyeTrackingModule testId={activeScreening.testId} onComplete={() => setActiveScreening(null)} />
        )}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm mt-4 font-light">Loading cognitive cockpit telemetry...</p>
      </div>
    );
  }

  // Get active risk tier colors
  const getRiskColor = (tier: string) => {
    if (tier === 'HIGH') return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
    if (tier === 'MEDIUM') return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto font-sans text-left relative">
      
      {/* Decorative Gradient Orbs */}
      <div className="gradient-orb w-96 h-96 bg-indigo-500 top-10 left-10" />
      <div className="gradient-orb w-[400px] h-[400px] bg-purple-500 bottom-10 right-10" />

      {/* Welcome Header Banner */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-cyan-950/15 p-6 sm:p-8 rounded-3xl border border-indigo-500/10 relative overflow-hidden backdrop-blur-md">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-space">
              Student Diagnostic Cockpit
            </span>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-space">
              Active Session
            </span>
          </div>
          <h2 className="text-3xl font-space font-extrabold tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">{student.name}</span>!
          </h2>
          <p className="text-xs text-slate-400 font-light">
            Your reading metrics and neural focus scores were last refreshed on <span className="text-slate-200 font-semibold">{student.lastTested ? new Date(student.lastTested).toLocaleDateString() : 'Yesterday'}</span>.
          </p>
        </div>

        {/* Dynamic Metric Count-up Pill Roster */}
        <div className="flex flex-wrap items-center gap-6 relative z-10 pr-2">
          {/* Streak */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-md">
              <Flame className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Practice Streak</span>
              <span className="text-xl font-extrabold text-orange-400 font-space leading-none block mt-1">{animatedStreak} Days</span>
            </div>
          </div>

          {/* Complete */}
          <div className="flex items-center space-x-3 pl-0 sm:pl-6 border-l border-white/0 sm:border-indigo-500/15">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
              <CheckCircle className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Screenings</span>
              <span className="text-xl font-extrabold text-emerald-400 font-space leading-none block mt-1">{animatedCompletions} Finished</span>
            </div>
          </div>

          {/* Focus Score */}
          <div className="flex items-center space-x-3 pl-0 sm:pl-6 border-l border-white/0 sm:border-indigo-500/15">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-md">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Focus Rating</span>
              <span className="text-xl font-extrabold text-cyan-400 font-space leading-none block mt-1">{animatedFocus}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: Cognitive Radar, Longitudinal Trends, Assigned Exercises */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Radar Matrix & Trend Line Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* 1. Recharts Radar chart profile card */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-space block mb-0.5">Sensory Topology Mapping</span>
              <h3 className="text-base font-bold flex items-center space-x-2">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-400" />
                <span>Cognitive Radar Profile</span>
              </h3>
            </div>
            
            <div className="h-56 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(99, 102, 241, 0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} fontWeight={700} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.05)" />
                  <Radar 
                    name={student.name} 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    fill="url(#radarGradient)" 
                    fillOpacity={0.35} 
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-[10px] text-slate-500 text-center border-t border-indigo-500/5 pt-3.5 select-none font-medium">
              💡 Area expansion denotes high focus balance & rhythm.
            </div>
          </div>

          {/* 2. Recharts WPM trend line card */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-space block mb-0.5">Longitudinal Development</span>
              <h3 className="text-base font-bold flex items-center space-x-2">
                <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
                <span>Reading Pacing Velocity</span>
              </h3>
            </div>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wpmGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="focusGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} fontWeight={600} />
                  <YAxis stroke="#475569" fontSize={9} fontWeight={600} domain={[30, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#0d1526', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '12px', textAlign: 'left' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="WPM" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#wpmGlow)" name="WPM Speed" />
                  <Area type="monotone" dataKey="Focus" stroke="#6366f1" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#focusGlow)" name="Focus Level" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-slate-400 text-center border-t border-indigo-500/5 pt-3.5 select-none flex justify-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                <span>WPM Pace (Words/Min)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-indigo-500 block" />
                <span>Focus Span Rating</span>
              </span>
            </div>
          </div>

        </div>

        {/* 3. Assignable active testing tasks lists */}
        <div className="glass-panel rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-lg font-space font-extrabold">Assigned Screening Exercises</h3>
            <p className="text-xs text-slate-400 font-light">Select and launch a sensory screening task assigned by your educator.</p>
          </div>
          
          <div className="space-y-3">
            {readingTests.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No tests currently populated.</p>
            ) : (
              readingTests.map((test) => {
                const isVoice = test.category.toLowerCase().includes('voice') || test.category.toLowerCase().includes('reading') || test.category.toLowerCase().includes('general');
                const isTyping = test.category.toLowerCase().includes('dyslexia') || test.category.toLowerCase().includes('typing');
                const isEye = test.category.toLowerCase().includes('adhd') || test.category.toLowerCase().includes('gaze') || test.category.toLowerCase().includes('eye');

                return (
                  <div 
                    key={test.id}
                    className="p-4 rounded-2xl bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-indigo-500/15 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs flex-shrink-0 transition-transform group-hover:scale-105 duration-300 ${
                        isTyping 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : isVoice 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {isTyping ? <Keyboard className="w-5.5 h-5.5" /> : isVoice ? <Mic className="w-5.5 h-5.5" /> : <Eye className="w-5.5 h-5.5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">{test.category}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            test.difficulty === 'Easy' 
                              ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/15'
                              : test.difficulty === 'Medium'
                                ? 'text-amber-400 bg-amber-500/5 border-amber-500/15'
                                : 'text-rose-400 bg-rose-500/5 border-rose-500/15'
                          }`}>
                            {test.difficulty}
                          </span>
                          <span className="text-[9px] text-slate-500">🕒 {test.estimatedTime}s</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mt-1">{test.title}</h4>
                        <p className="text-[11px] text-slate-400 max-w-[480px] font-light leading-relaxed mt-1 block">
                          {test.text}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setActiveScreening({
                        type: isTyping ? 'typing' : isVoice ? 'voice' : 'eye',
                        testId: test.id
                      })}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-xs text-white hover:scale-102 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/10 transition-all shrink-0 group-hover:shadow-indigo-600/20"
                    >
                      <span>Launch Workout</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Unlocked Milestones, Risk gauges, AI Recommendations */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Risk profile widget */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 space-y-4">
          <div className="border-b border-indigo-500/10 pb-3">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-space block mb-0.5">Telemetry Diagnostic Insights</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
              <span>Dyslexia Risk Quotient</span>
            </h3>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-950/40 border border-slate-900 relative">
            <span className={`absolute top-3 right-3 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${getRiskColor(activeReport?.dyslexiaRisk || 'MEDIUM')}`}>
              {activeReport?.dyslexiaRisk || 'MEDIUM'} RISK
            </span>
            
            <div className="relative w-28 h-28 flex items-center justify-center mt-3">
              {/* Circular border glow */}
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/5" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 border-l-indigo-500/20 border-b-indigo-500/10 animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
              <div>
                <span className="text-2xl font-space font-extrabold text-slate-100">{animatedRiskProb}%</span>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">Quotient</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal font-light mt-4 max-w-[240px]">
              Mild hesitation delays found in phonology. OpenDyslexic spacing aids recommended.
            </p>
          </div>
        </div>
        
        {/* 1. Gamified Achievement Badge Deck */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 space-y-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-space block mb-0.5">Gamified Milestones</span>
            <h3 className="text-base font-bold flex items-center space-x-2">
              <Award className="w-4.5 h-4.5 text-emerald-400" />
              <span>Unlocked Achievement Badges</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {student.badges && student.badges.length > 0 ? (
              student.badges.map((badge) => {
                let badgeEmoji = '🏆';
                if (badge.icon === 'keyboard') badgeEmoji = '⌨';
                if (badge.icon === 'zap') badgeEmoji = '⚡';
                if (badge.icon === 'award') badgeEmoji = '🏅';
                return (
                  <div 
                    key={badge.id}
                    onClick={() => triggerConfetti(badge.name)}
                    className="p-4 bg-slate-950/40 hover:bg-slate-900 border border-slate-900 hover:border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300 relative overflow-hidden"
                    title="Click to celebrate badge milestone!"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-3xl block group-hover:scale-110 duration-300 transition-transform transform-gpu">{badgeEmoji}</span>
                    <span className="text-xs font-bold text-slate-200 mt-2.5 block truncate w-full">{badge.name}</span>
                    <span className="text-[9px] text-slate-500 mt-1">{badge.date ? new Date(badge.date).toLocaleDateString() : 'May 30'}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 col-span-2 text-center py-4">No badges unlocked yet.</p>
            )}
          </div>
        </div>

        {/* 2. AI Recommendation Deck with Try Exercise Trigger */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 space-y-4">
          <div className="border-b border-indigo-500/10 pb-3">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest font-space block mb-0.5">Adaptive Guidance</span>
            <h3 className="text-base font-bold flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
              <span>AI Study Recommendations</span>
            </h3>
          </div>

          <div className="space-y-3">
            {activeReport?.recommendations ? (
              (typeof activeReport.recommendations === 'string' ? JSON.parse(activeReport.recommendations) : activeReport.recommendations).map((rec: string, index: number) => (
                <div 
                  key={index}
                  className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-900 hover:border-indigo-500/15 text-xs text-slate-300 leading-relaxed font-light flex flex-col space-y-2.5"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5 animate-pulse" />
                    <span>{rec}</span>
                  </div>
                  
                  <button
                    onClick={() => handleTryExercise(rec)}
                    className="self-end px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 hover:border-indigo-500/40 text-[10px] font-bold uppercase tracking-wider text-indigo-300 rounded-lg flex items-center space-x-1 cursor-pointer transition-all active:scale-98"
                  >
                    <span>Train Recommendation</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No suggestions currently available.</p>
            )}
          </div>
        </div>

        {/* 3. Safety Notice Box */}
        <div className="p-4.5 rounded-2xl bg-slate-950/40 border border-yellow-500/10 text-slate-400 text-[10px] leading-relaxed font-sans space-y-1.5">
          <span className="text-yellow-500/80 font-bold block flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>MEDICAL DISCLAIMER</span>
          </span>
          <p>
            This cockpit provides AI-assisted educational screening diagnostics only. All metrics are designed for classroom curriculum tracking, not clinical evaluations.
          </p>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
