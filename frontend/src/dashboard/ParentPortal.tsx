import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Heart, 
  Award, 
  Flame, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Info,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export const ParentPortal: React.FC = () => {
  const { students, aiReports, user } = useStore();

  // Find the child Sophia Alvarez (associated with parent login)
  const child = students.find(s => s.name === 'Sophia Alvarez') || students[0];
  const activeReport = aiReports.find(r => r.studentId === child.id) || aiReports[0];

  // Friendly non-clinical parent stats trends
  const trendData = child.metricsHistory.map(metric => ({
    name: metric.date,
    Pace: metric.wpm,
    Focus: metric.focusScore
  }));

  const unlockedBadges = child.badges;

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto font-sans text-left">
      
      {/* 1. Header welcome */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-indigo-950/10 p-6 rounded-3xl border border-white/5">
        <div className="space-y-1">
          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-rajdhani">Parent Cockpit</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Supportive Growth Companion</h2>
          <p className="text-xs text-slate-400 font-light">Monitor your child's cognitive development progress, practice streaks, and recommended at-home exercises.</p>
        </div>

        {/* Status meters */}
        <div className="flex items-center space-x-6 pr-2">
          {/* Active streak */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Practice Streak</span>
              <span className="text-lg font-black text-orange-400 font-rajdhani block leading-none mt-0.5">{child.streakDays} Days</span>
            </div>
          </div>
          {/* Complete */}
          <div className="flex items-center space-x-2.5 pl-4 border-l border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
              <Heart className="w-5 h-5  text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Support Level</span>
              <span className="text-lg font-black text-purple-400 font-rajdhani block leading-none mt-0.5">Custom Plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LEFT: Progress Graphs & Timeline */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Child Focus curve card */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Development curve</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
              <span>Weekly Attention Focus Progress for {child.name}</span>
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
                  itemStyle={{ color: '#a855f7', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="Focus" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-xs text-purple-300 font-light select-none">
            💡 <span className="font-semibold text-slate-200">What this means:</span> An upward trend reflects increased attention consistency, focus span durations, and fewer off-screen visual distractions over time.
          </div>
        </div>

        {/* Milestone history deck */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <h3 className="text-base font-bold flex items-center space-x-2">
            <Award className="w-4.5 h-4.5 text-indigo-400" />
            <span>Unlocked Milestone Badges ({unlockedBadges.length})</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {unlockedBadges.length === 0 ? (
              <p className="text-xs text-slate-500 col-span-3 text-center py-4">No milestone badges unlocked yet.</p>
            ) : (
              unlockedBadges.map(badge => (
                <div 
                  key={badge.id}
                  className="p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl flex items-center space-x-3 text-left"
                >
                  <span className="text-3xl shrink-0">{badge.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 truncate">{badge.name}</h4>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{badge.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. RIGHT: Parents guide & Exercises */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* At home recommendations deck */}
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani block mb-0.5">Home curriculum support</span>
            <h3 className="text-base font-bold flex items-center space-x-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
              <span>Recommended At-Home Activities</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-light space-y-2">
              <span className="font-bold text-slate-100 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Dyslexic Font Spaced Reading</span>
              </span>
              <p>Practice reading a simple chapter book using double letter spacing spacing for 10 minutes tonight. You can enable this font in the top-right menu.</p>
            </div>
            
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-light space-y-2">
              <span className="font-bold text-slate-100 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Attention Micro-Breaks</span>
              </span>
              <p>Break reading exercises into small segments. Take active 2-minute stretch pauses to keep fatigue and eye strain low.</p>
            </div>
          </div>
        </div>

        {/* Safety Medical Disclaimers */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-yellow-500/10 text-[10px] text-slate-400 leading-normal font-sans">
          <span className="font-bold text-yellow-500 block mb-1">⚠ SUPPORTIVE PARENT NOTICE</span>
          <p>
            This portal tracks visual practice indices to assist in home learning routines. All findings denote cognitive indicators and do not formulate clinical assessments.
          </p>
        </div>

      </div>

    </div>
  );
};
export default ParentPortal;
