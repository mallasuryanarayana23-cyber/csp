import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { VoiceModule } from '../modules/VoiceModule';
import { TypingModule } from '../modules/TypingModule';
import { EyeTrackingModule } from '../modules/EyeTrackingModule';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip 
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
  BrainCircuit
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentDashboard: React.FC = () => {
  const { students, readingTests, aiReports, user, addNotification } = useStore();
  
  // Default to Sophia Alvarez to match our mock datasets
  const student = students.find(s => s.email === (user?.email || 'sophia@neurolearn.org')) || students[0];
  const activeReport = aiReports.find(r => r.studentId === student.id) || aiReports[0];

  // Active modular testing screens state
  const [activeScreening, setActiveScreening] = useState<{ type: 'voice' | 'typing' | 'eye'; testId: string } | null>(null);

  // Trigger confetti for gamification milestone badges
  const triggerConfetti = (badgeName: string) => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#10b981']
    });
    
    addNotification(
      'Milestone Celebration!',
      `You interacted with your "${badgeName}" badge! Keep up the spectacular cognitive practice.`,
      'success'
    );
  };

  // 1. Recharts Radar chart mapper for cognitive profiling
  const radarData = [
    { subject: 'Visual Pacing', value: student.metricsHistory[student.metricsHistory.length - 1]?.readingSpeed || 60, fullMark: 100 },
    { subject: 'Attention Span', value: student.focusScore, fullMark: 100 },
    { subject: 'Typing Rhythm', value: activeReport?.typingRhythmConsistency || 60, fullMark: 100 },
    { subject: 'Speech Fluency', value: activeReport?.speechFluencyScore || 60, fullMark: 100 },
    { subject: 'Focus Consistency', value: Math.round(100 - (student.metricsHistory[student.metricsHistory.length - 1]?.distractionEvents * 8)), fullMark: 100 },
  ];

  // 2. Recharts WPM trend line mapper
  const trendData = student.metricsHistory.map(metric => ({
    name: metric.date,
    WPM: metric.wpm,
    Focus: metric.focusScore
  }));

  if (activeScreening) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        {/* Floating return trigger */}
        <button
          onClick={() => setActiveScreening(null)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 cursor-pointer"
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

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto font-sans text-left">
      
      {/* Dynamic Header */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-emerald-950/10 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-rajdhani">Student Cockpit</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-rajdhani">Calibration Ready</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back, <span className="text-indigo-300">{student.name}</span>!</h2>
          <p className="text-xs text-slate-400 font-light">Your cognitive screening parameters were last calibrated on <span className="text-slate-200 font-semibold">{student.lastTested}</span>.</p>
        </div>

        {/* Top Status Indicators (Streak, Complete, Focus) */}
        <div className="flex items-center space-x-6 relative z-10 pr-2">
          {/* Streak */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
              <Flame className="w-5 h-5 " />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Practice Streak</span>
              <span className="text-lg font-black text-orange-400 font-rajdhani leading-none block mt-0.5">{student.streakDays} Days</span>
            </div>
          </div>
          {/* Complete */}
          <div className="flex items-center space-x-2.5 pl-4 border-l border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Screenings</span>
              <span className="text-lg font-black text-emerald-400 font-rajdhani leading-none block mt-0.5">{student.completedTests.length} Finished</span>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: Sensory Radar & Trends */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Radar Matrix & Trend Line Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* 1. Recharts Radar chart profile card */}
          <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Sensory Topology Mapping</span>
              <h3 className="text-base font-bold flex items-center space-x-1.5">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>Cognitive Radar Profile</span>
              </h3>
            </div>
            
            <div className="h-56 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} fontWeight={600} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.1)" />
                  <Radar 
                    name={student.name} 
                    dataKey="value" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.25} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-[10px] text-slate-400 text-center border-t border-white/5 pt-2 select-none">
              💡 Area expansion denotes high focus balance & rhythm.
            </div>
          </div>

          {/* 2. Recharts WPM trend line card */}
          <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Development Curves</span>
              <h3 className="text-base font-bold flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Reading Pacing Velocity (WPM)</span>
              </h3>
            </div>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} domain={[30, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#6366f1', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="WPM" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Focus" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-slate-400 text-center border-t border-white/5 pt-2 select-none flex justify-center space-x-4">
              <span>● <span className="text-emerald-400 font-bold">WPM Pace</span></span>
              <span>--- <span className="text-indigo-400 font-bold">Focus Span</span></span>
            </div>
          </div>

        </div>

        {/* 3. Assignable active testing tasks lists */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div>
            <h3 className="text-lg font-bold">Assigned Screening Assessments</h3>
            <p className="text-xs text-slate-400 font-light">Select and launch a sensory screening task assigned by your educator.</p>
          </div>
          
          <div className="space-y-3">
            {student.assignedTests.map(testId => {
              const test = readingTests.find(t => t.id === testId);
              if (!test) return null;

              const isVoice = test.category === 'General Reading' || test.category === 'Memory Recall';
              const isTyping = test.category === 'Dyslexia Screening';
              const isEye = test.category === 'ADHD Assessment';

              return (
                <div 
                  key={test.id}
                  className="p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs shadow-inner ${
                      isTyping ? 'bg-indigo-500/10 text-indigo-400' : isVoice ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {isTyping ? <Keyboard className="w-5 h-5" /> : isVoice ? <Mic className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold leading-none">{test.category}</span>
                      <h4 className="text-sm font-bold text-slate-200 mt-1">{test.title}</h4>
                      <p className="text-[10px] text-slate-400 max-w-[340px] truncate mt-0.5">{test.text}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setActiveScreening({
                      type: isTyping ? 'typing' : isVoice ? 'voice' : 'eye',
                      testId: test.id
                    })}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-xs text-white hover:scale-102 flex items-center space-x-1.5 cursor-pointer shadow-md transition-all shrink-0"
                  >
                    <span>Launch</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Achievements & AI Recommendations */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* 1. Gamified Achievement Badge Deck */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Gamified Progress</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <Award className="w-4.5 h-4.5 text-indigo-400" />
              <span>Unlocked Milestones</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {student.badges.map(badge => (
              <div 
                key={badge.id}
                onClick={() => triggerConfetti(badge.name)}
                className="p-3 bg-slate-950/60 hover:bg-slate-900 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-300"
                title="Click to celebrate badge milestone!"
              >
                <span className="text-3xl block group-hover:scale-110 duration-300">{badge.icon}</span>
                <span className="text-xs font-bold text-slate-200 mt-2 block truncate w-full">{badge.name}</span>
                <span className="text-[9px] text-slate-500 mt-0.5">{badge.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. AI Recommendation Deck */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Adaptive Guidance</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
              <span>AI Study Plan Recommendations</span>
            </h3>
          </div>

          <div className="space-y-3">
            {activeReport?.recommendations.map((rec, index) => (
              <div 
                key={index}
                className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-light flex items-start space-x-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Safety Notice Box */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-yellow-500/10 text-slate-400 text-[10px] leading-normal font-sans space-y-1">
          <span className="text-yellow-500 font-bold block">⚠ MEDICAL DISCLAIMER WARNING</span>
          <p>
            This cockpit provides AI-assisted educational screening diagnostics only. All metrics are designed for classroom curriculum tracking, not clinical evaluations.
          </p>
        </div>

      </div>

    </div>
  );
};
export default StudentDashboard;
