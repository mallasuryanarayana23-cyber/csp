import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Heart, 
  Award, 
  Flame, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Info,
  ChevronRight,
  BookOpen,
  Link,
  Mail,
  UserCheck,
  CheckCircle,
  Activity,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../../services/api/client';

export const ParentPortal: React.FC = () => {
  const { students, aiReports, user, fetchStudents, fetchReports, addNotification } = useStore();
  const [childEmail, setChildEmail] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkingError, setLinkingError] = useState('');
  const [linkingSuccess, setLinkingSuccess] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Find linked child profile (matching parentId on StudentProfile to current parent userId)
  const child = students.find(s => s.parentId === user?.id);
  const activeReport = child ? aiReports.find(r => r.studentId === child.id) : null;

  useEffect(() => {
    if (child?.id) {
      fetchReports(child.id);
    }
  }, [child?.id]);

  // Handle linking child email
  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childEmail) return;
    setLinkingLoading(true);
    setLinkingError('');
    setLinkingSuccess(false);

    try {
      const res = await apiClient.post('/api/parent/link-child', { childEmail });
      setLinkingSuccess(true);
      addNotification(
        'Profile Linked!',
        `Successfully linked child profile: ${childEmail}`,
        'success'
      );
      // Reload students list to populate linked child
      await fetchStudents();
    } catch (err: any) {
      setLinkingError(err.response?.data?.error || 'No student found with that email address.');
      addNotification('Linkage Failed', 'Student email could not be aligned.', 'warning');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Friendly parent-oriented stats curves
  const trendData = child && (child as any).metricsHistory ? (child as any).metricsHistory.map((metric: any) => ({
    name: metric.date,
    Pace: metric.wpm || 70,
    Focus: metric.focusScore || 90
  })) : [
    { name: 'Mon', Pace: 64, Focus: 82 },
    { name: 'Tue', Pace: 70, Focus: 85 },
    { name: 'Wed', Pace: 72, Focus: 88 },
    { name: 'Thu', Pace: 78, Focus: 92 },
    { name: 'Fri', Pace: 82, Focus: 94 }
  ];

  const unlockedBadges = child?.badges || [];

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto font-sans text-left relative">
      
      {/* Decorative space-orbs */}
      <div className="gradient-orb w-96 h-96 bg-purple-500/10 top-10 left-10" />
      <div className="gradient-orb w-[400px] h-[400px] bg-indigo-500/5 bottom-10 right-10" />

      {/* Header welcome banner */}
      <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-purple-950/20 via-slate-900/40 to-indigo-950/15 p-6 sm:p-8 rounded-3xl border border-purple-500/15 backdrop-blur-md relative z-10">
        <div className="space-y-2">
          <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest font-space">
            Parent Support Companion
          </span>
          <h2 className="text-3xl font-space font-extrabold tracking-tight">
            Supportive Growth Companion
          </h2>
          <p className="text-xs text-slate-400 font-light leading-relaxed max-w-2xl">
            Monitor your child's visual reading patterns, practice streaks, and recommendations using parent-friendly metrics mapped without clinical complexities.
          </p>
        </div>

        {child && (
          <div className="flex items-center gap-6 pr-2 shrink-0">
            {/* Practice streak */}
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-md">
                <Flame className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Practice Streak</span>
                <span className="text-xl font-extrabold text-orange-400 font-space leading-none block mt-1">{child.streakDays} Days</span>
              </div>
            </div>

            {/* Support Level */}
            <div className="flex items-center space-x-3 pl-6 border-l border-indigo-500/15">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-md">
                <Heart className="w-5.5 h-5.5 text-purple-400" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Support Plan</span>
                <span className="text-xl font-extrabold text-purple-400 font-space leading-none block mt-1">Adaptive</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UNLINKED PORTAL STATE: Email Linker Form Card */}
      {!child ? (
        <div className="lg:col-span-12 flex flex-col items-center justify-center py-14 px-4 relative z-10">
          <div className="w-full max-w-[460px] bg-[#0d1526]/85 border border-indigo-500/15 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                <Link className="w-7 h-7" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-space font-extrabold text-slate-200">Connect Your Child's Profile</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[340px] mx-auto">
                Align your parent cockpit with your child's registered student account email to begin tracing visual assessments and home learning curriculums.
              </p>
            </div>

            {linkingError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-bold">
                {linkingError}
              </div>
            )}

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Child's Registered Email
                </label>
                <div className="relative group">
                  <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="email"
                    required
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all"
                    placeholder="student@neurolearn.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={linkingLoading || !childEmail}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-indigo-500/10 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>{linkingLoading ? 'Establishing Linkage...' : 'Secure Profile Linkage'}</span>
              </button>
            </form>

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-normal">
                Your child must be pre-registered as a student under their own account email before you can link. Try linking to <span className="text-slate-200 font-bold">student@neurolearn.com</span> to walk through the sandbox profile.
              </p>
            </div>

          </div>
        </div>
      ) : (
        /* LINKED PORTAL STATE: Detailed Analytics & Parent Gauges */
        <>
          {/* LEFT COLUMN: Progress Curve & Milestone Badges */}
          <div className="lg:col-span-8 space-y-6 relative z-10">
            
            {/* Weekly Attention focus Area chart */}
            <div className="glass-panel rounded-3xl p-6 space-y-5">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest font-space block mb-0.5">Development Curve</span>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
                  <span>Weekly Focus & Pacing Progress for {child.name}</span>
                </h3>
              </div>

              <div className="h-56 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="parentFocusGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="parentPaceGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} fontWeight={600} />
                    <YAxis stroke="#475569" fontSize={9} fontWeight={600} domain={[30, 100]} />
                    <Tooltip 
                      contentStyle={{ background: '#0d1526', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Focus" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#parentFocusGlow)" name="Focus Level" />
                    <Area type="monotone" dataKey="Pace" stroke="#ec4899" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#parentPaceGlow)" name="Reading Speed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3.5 bg-purple-500/5 rounded-xl border border-purple-500/10 text-xs text-purple-300 font-light leading-relaxed select-none">
                💡 <span className="font-semibold text-slate-200">What this means:</span> An upward trend reflects increased attention consistency, focus span durations, and fewer off-screen visual distractions over time.
              </div>
            </div>

            {/* Milestone Badge Gallery */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Award className="w-4.5 h-4.5 text-indigo-400" />
                <span>Unlocked Milestone Badges ({unlockedBadges.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unlockedBadges.length === 0 ? (
                  <p className="text-xs text-slate-500 col-span-3 text-center py-4">No milestone badges unlocked yet.</p>
                ) : (
                  unlockedBadges.map((badge: any) => {
                    let badgeEmoji = '🏆';
                    if (badge.icon === 'keyboard') badgeEmoji = '⌨';
                    if (badge.icon === 'zap') badgeEmoji = '⚡';
                    if (badge.icon === 'award') badgeEmoji = '🏅';
                    return (
                      <div 
                        key={badge.id}
                        className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl flex items-center space-x-3 text-left"
                      >
                        <span className="text-3xl shrink-0">{badgeEmoji}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 truncate">{badge.name}</h4>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{badge.date ? new Date(badge.date).toLocaleDateString() : 'May 30'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Focus Gauges & Home Exercises */}
          <div className="lg:col-span-4 space-y-6 relative z-10">
            
            {/* Friendly Non-Clinical Gauges */}
            <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 space-y-4">
              <div className="border-b border-indigo-500/10 pb-3">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-space block mb-0.5">Parent Friendly Summary</span>
                <h3 className="text-base font-bold flex items-center space-x-1.5">
                  <Heart className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Cognitive Performance Gauges</span>
                </h3>
              </div>

              <div className="space-y-4">
                
                {/* Gauge 1: Reading Pace */}
                <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span>Reading Pace</span>
                    <span className="text-emerald-400">Excellent Tracking Pace</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                {/* Gauge 2: Speech Fluency */}
                <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span>Speech Phonetics</span>
                    <span className="text-indigo-400">Steady Phonetics Progress</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                {/* Gauge 3: Attention Focus */}
                <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span>Attention Focus</span>
                    <span className="text-cyan-400">Highly Focused Reader</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-900">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${child.focusScore}%` }} />
                  </div>
                </div>

              </div>
            </div>

            {/* At home recommendations deck */}
            <div className="glass-panel rounded-3xl p-5 border border-indigo-500/10 space-y-4">
              <div className="border-b border-indigo-500/10 pb-3">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-space block mb-0.5">Home Curriculum Support</span>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Recommended At-Home Activities</span>
                </h3>
              </div>

              <div className="space-y-3.5">
                {activeReport?.recommendations ? (
                  (typeof activeReport.recommendations === 'string' ? JSON.parse(activeReport.recommendations) : activeReport.recommendations).map((rec: string, index: number) => {
                    const isSpacing = rec.toLowerCase().includes('spacing') || rec.toLowerCase().includes('dyslexia');
                    return (
                      <div 
                        key={index}
                        className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-900 text-xs text-slate-300 leading-relaxed font-light space-y-2"
                      >
                        <span className="font-bold text-slate-100 flex items-center space-x-1.5">
                          {isSpacing ? <BookOpen className="w-4.5 h-4.5 text-purple-400" /> : <Calendar className="w-4.5 h-4.5 text-emerald-400" />}
                          <span>{isSpacing ? 'Dyslexic Font Spaced Reading' : 'Attention Micro-Breaks'}</span>
                        </span>
                        <p>{rec}</p>
                      </div>
                    );
                  })
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Supportive Parent Notice disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-yellow-500/10 text-slate-400 text-[10px] leading-relaxed font-sans space-y-1">
              <span className="text-yellow-500/80 font-bold block flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>SUPPORTIVE PARENT NOTICE</span>
              </span>
              <p>
                This portal tracks visual practice indices to assist in home learning routines. All findings denote cognitive indicators and do not formulate clinical assessments.
              </p>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default ParentPortal;
