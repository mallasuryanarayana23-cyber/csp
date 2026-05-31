import React, { useState, useRef, useEffect } from 'react';
import ParticleNetwork from './ParticleNetwork';
import { useStore } from '../../store/useStore';
import { useCountUp } from '../../hooks/useCountUp';
import { 
  Keyboard, 
  Mic, 
  Eye, 
  Brain, 
  TrendingUp, 
  Lock, 
  Activity, 
  Users, 
  Award, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Mail,
  ChevronDown,
  Sparkles,
  Play,
  Heart,
  LineChart as ChartIcon,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC<{ onEnterDashboard: () => void }> = ({ onEnterDashboard }) => {
  const { login } = useStore();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'parent'>('student');
  
  // Stats count up values
  const accuracyCount = useCountUp(94);
  const modalitiesCount = useCountUp(3);
  const latencyCount = useCountUp(18); // represented as 1.8s
  const schoolsCount = useCountUp(500);

  // Typing Dynamics Mini-Demo State
  const [demoText, setDemoText] = useState('');
  const [typingStats, setTypingStats] = useState({
    keystrokes: 0,
    delays: [] as number[],
    substitutions: 0,
  });
  const lastKeyTime = useRef<number | null>(null);

  const handleDemoTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const now = Date.now();
    
    let keyDelay = 0;
    if (lastKeyTime.current) {
      keyDelay = now - lastKeyTime.current;
    }
    lastKeyTime.current = now;

    let subCount = typingStats.substitutions;
    // Check common letter confusions
    if (text.length > demoText.length) {
      const addedChar = text[text.length - 1].toLowerCase();
      const prevChar = text.length > 1 ? text[text.length - 2].toLowerCase() : '';
      if (
        (addedChar === 'd' && prevChar === 'b') || 
        (addedChar === 'b' && prevChar === 'd') ||
        (addedChar === 'q' && prevChar === 'p') ||
        (addedChar === 'p' && prevChar === 'q')
      ) {
        subCount += 1;
      }
    }

    setDemoText(text);
    setTypingStats(prev => ({
      keystrokes: prev.keystrokes + 1,
      delays: [...prev.delays, keyDelay].slice(-20), // store last 20 delay intervals
      substitutions: subCount
    }));
  };

  const averageDelay = typingStats.delays.length > 0
    ? Math.round(typingStats.delays.reduce((a, b) => a + b, 0) / typingStats.delays.length)
    : 0;

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqData = [
    {
      q: "How does the platform screen for learning difficulties without medical devices?",
      a: "NeuroLearn uses consumer-grade hardware (webcam and keyboard/microphone) to run research-backed behavioral analysis. By tracking microscopic delays in keystrokes, voice hesitation intervals during reading exercises, and rapid gaze displacement paths, the system identifies patterns heavily correlated with dyslexia or executive focus stress."
    },
    {
      q: "Is student data protected and HIPAA/COPPA compliant?",
      a: "Absolutely. NeuroLearn implements institutional-grade end-to-end data encryption. Webcam eye tracking operates fully client-side inside the student's browser canvas; no video feeds are ever stored or transmitted to our servers. Only numeric telemetry indices are cached for reporting."
    },
    {
      q: "Can teachers use these analytics to assign custom curricula?",
      a: "Yes. The Teacher Portal offers a Risk Detection Grid and automated Intervention Plans. Teachers can assign structured, dyslexia-friendly fonts or micro-break guides based on individual attention maps."
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-100 font-sans overflow-hidden bg-[#050816]">
      
      {/* Background Pulsing Gradient Orbs */}
      <div className="gradient-orb top-[-10%] left-[-15%] w-[600px] h-[600px] bg-indigo-500/10"></div>
      <div className="gradient-orb bottom-[-20%] right-[-15%] w-[700px] h-[700px] bg-purple-500/10"></div>
      <div className="gradient-orb top-[40%] right-[10%] w-[500px] h-[500px] bg-cyan-500/5"></div>

      {/* Dynamic Background Network */}
      <div className="absolute inset-0 z-0 min-h-screen">
        <ParticleNetwork />
      </div>

      {/* Main Content Scroll Wrap */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-36">
        
        {/* 1. Hero Showcase Section */}
        <section className="grid lg:grid-cols-12 gap-12 items-center pt-6">
          <div className="lg:col-span-7 text-left space-y-8 max-w-3xl">
            {/* Decorative Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Patent-Pending Cognitive Detection Architecture</span>
            </div>

            {/* Heading Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] font-space">
              Detect Learning <br />
              Differences Early. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                Change Lives.
              </span>
            </h1>

            {/* Descriptive Pitch */}
            <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed">
              Detect subtle markers of Dyslexia, ADHD, and cognitive learning stress in students through real-time keystroke dynamics, speech fluency patterns, and webcam gaze-tracking analytics.
            </p>

            {/* Important Medical Disclaimer Warning Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-yellow-500/20 text-yellow-500/90 text-xs font-semibold tracking-wide max-w-xl">
              ⚠ "This platform provides AI-assisted educational screening and behavioral insights only, not medical diagnosis."
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => {
                  login('sophia@neurolearn.org', 'student');
                  onEnterDashboard();
                }}
                className="glow-btn w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:shadow-md hover:scale-102 transition-all duration-300 flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  login('sarah@neurolearn.org', 'teacher');
                  onEnterDashboard();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 font-bold hover:bg-slate-800 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Isometric Dashboard Mockup Container */}
          <div className="lg:col-span-5 hidden lg:block select-none perspective-card">
            <div className="w-full rounded-2xl glass-panel-glow border border-indigo-500/20 p-4 shadow-2xl relative transition-transform duration-500 hover:rotate-0 transform rotate-x-12 rotate-y--12 rotate-3 translate-z-10">
              
              {/* Fake Dashboard Layout Visual */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono">NEUROLEARN_COCKPIT_V4.0</span>
                </div>
                
                {/* Metric overview widget */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-[#050816]/80 rounded-lg border border-white/5 text-left">
                    <span className="text-[8px] text-slate-500 uppercase font-semibold">Focus Score</span>
                    <span className="text-sm font-bold text-indigo-400 block font-space">88%</span>
                  </div>
                  <div className="p-2 bg-[#050816]/80 rounded-lg border border-white/5 text-left">
                    <span className="text-[8px] text-slate-500 uppercase font-semibold">Gaze Drift</span>
                    <span className="text-sm font-bold text-emerald-400 block font-space">Low</span>
                  </div>
                  <div className="p-2 bg-[#050816]/80 rounded-lg border border-white/5 text-left">
                    <span className="text-[8px] text-slate-500 uppercase font-semibold">Risk Level</span>
                    <span className="text-sm font-bold text-cyan-400 block font-space">Minimal</span>
                  </div>
                </div>

                {/* Simulated Recharts Gaze Deviation Scatter Chart */}
                <div className="h-32 bg-[#050816]/60 rounded-xl border border-white/5 p-2 flex items-end justify-between relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-indigo-500/20"></div>
                  </div>
                  {[45, 55, 38, 70, 85, 92, 60, 78, 88].map((val, idx) => (
                    <div 
                      key={idx} 
                      className="w-4 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-sm"
                      style={{ height: `${val}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* AI diagnosis block */}
                <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/15 flex items-center justify-between text-left">
                  <div>
                    <span className="text-[8px] text-indigo-300 block uppercase font-bold tracking-wider">AI Recommendation</span>
                    <span className="text-[10px] text-slate-200 block">Dyslexic spaced text mode calibrated.</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. Interactive Typing Dynamics Mini-Demo */}
        <section className="glass-panel rounded-3xl p-6 md:p-10 border border-white/10 relative shadow-2xl">
          <div className="absolute top-0 right-0 p-3 rounded-bl-2xl bg-indigo-500/10 border-l border-b border-white/5 text-[10px] uppercase font-bold tracking-widest text-indigo-400">
            Live Sandbox
          </div>
          
          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-5 space-y-4 text-left">
              <div className="p-2 w-max bg-emerald-500/15 text-emerald-400 rounded-lg">
                <Keyboard className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-space">Experience Keystroke Analytics</h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Type the sample sentence on the right. Our system tracks microsecond variations in flight-time, key-hold intervals, and letter confusion cues correlating with learning fatigue or dyslexia patterns.
              </p>
              
              {/* Dynamic Output Cards */}
              <div className="grid grid-cols-2 gap-3.5 pt-3 font-space">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-left">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Average Delay</span>
                  <span className="text-lg font-bold text-indigo-400 font-mono-data">{averageDelay}ms</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-left">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Confusion Score</span>
                  <span className={`text-lg font-bold ${typingStats.substitutions > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {typingStats.substitutions > 1 ? 'High Risk' : typingStats.substitutions > 0 ? 'Medium Risk' : 'Optimal'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-3.5">
              <div className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-white/5 text-left select-none">
                💡 <span className="font-semibold text-slate-200">Copy this phrase:</span> "The brave brown badger built a big beautiful bridge quickly."
              </div>
              <textarea
                value={demoText}
                onChange={handleDemoTyping}
                placeholder="Start typing the phrase above to see micro-analysis..."
                rows={3}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans tracking-wide transition-all"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-space">
                <span>Key hold cycles: <span className="text-indigo-400 font-bold font-mono-data">{typingStats.keystrokes}</span></span>
                <span>Letter overlaps (b/d confusions): <span className="text-amber-400 font-bold font-mono-data">{typingStats.substitutions}</span></span>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Core AI Modalities Grid (6 Features) */}
        <section className="space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-space">Multi-Modal Screening Engines</h2>
            <p className="text-slate-400 text-sm font-light">
              We compile sensory metrics from three physical interaction modes into a single unified behavioral profile.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            
            {/* AI Screening Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold font-space">AI-Powered Screening</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ensemble learning pipelines evaluating multisensory coordinates to map focus attention scores and learning stress tiers.
              </p>
            </div>

            {/* Gaze Tracker Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Eye className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold font-space">Real-Time Eye Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses MediaPipe client-side algorithms inside the browser to map facial mesh focus limits and capture rapid attention deviations.
              </p>
            </div>

            {/* Voice Fluency Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Mic className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold font-space">Speech Analysis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ASR transcription using PyTorch Whisper pipelines to screen phoneme hesitations, pacing hitches, and sound wave amplitudes.
              </p>
            </div>

            {/* Keystroke Dynamics Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Keyboard className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold font-space">Keystroke Dynamics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Measures typing dwell flight intervals, corrections ratios, and character overlaps indicating spelling fatigue.
              </p>
            </div>

            {/* Instant Reports Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold font-space">Instant Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates official institutional PDF analysis cards gathering metrics, historical timelines, and recommendations.
              </p>
            </div>

            {/* Parent Insights Card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold font-space">Parent Insights</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Actionable growth trackers in plain language with step-by-step at-home activity guides.
              </p>
            </div>

          </div>
        </section>

        {/* 4. How It Works Section */}
        <section className="space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold font-space">How It Works</h2>
            <p className="text-slate-400 text-xs">A transparent 3-step connected workflow ensuring reliable analytics.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center text-center font-space relative">
            
            {/* Step 1 */}
            <div className="space-y-4 relative">
              <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-lg font-bold mx-auto shadow-lg">1</div>
              <h4 className="text-base font-bold">Student Takes Test</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Student reads text aloud and types brief phrases inside the secured interactive game browser screen.</p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-lg font-bold mx-auto shadow-lg">2</div>
              <h4 className="text-base font-bold">AI Analyzes Behavior</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Neural pipeline aggregates visual focus, speech pacing, and typing delays into clean data models.</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-lg font-bold mx-auto shadow-lg">3</div>
              <h4 className="text-base font-bold">Teacher Gets Report</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">Educator receives instant Risk alert matrices, developmental longitudinal timelines, and recommendations.</p>
            </div>

          </div>
        </section>

        {/* 5. Stats Counter Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-space">
          <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-4xl md:text-5xl font-bold text-indigo-400 font-mono-data">{accuracyCount}%</span>
            <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-wider font-semibold">Detection Accuracy</p>
          </div>
          <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-4xl md:text-5xl font-bold text-purple-400 font-mono-data">{modalitiesCount}</span>
            <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-wider font-semibold">Screening Modalities</p>
          </div>
          <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-4xl md:text-5xl font-bold text-cyan-400 font-mono-data">&lt; {(latencyCount/10).toFixed(1)}s</span>
            <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-wider font-semibold">AI Inference Speed</p>
          </div>
          <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
            <span className="text-4xl md:text-5xl font-bold text-emerald-400 font-mono-data">{schoolsCount}+</span>
            <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-wider font-semibold">Active Schools</p>
          </div>
        </section>

        {/* 6. Frequently Asked Questions Section */}
        <section className="space-y-8 max-w-3xl mx-auto">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-space">Technology & Integration FAQ</h2>
            <p className="text-slate-400 text-xs">Standard operational mechanics of the NeuroLearn architecture.</p>
          </div>

          <div className="space-y-4 text-left">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className="rounded-xl bg-slate-900/40 border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="p-5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-white/5 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>

        {/* 7. Testimonials & Footer CTA */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 border border-white/10 text-center relative overflow-hidden space-y-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-500/5 pointer-events-none"></div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-space">Begin Early Screening Support Today</h2>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Equip your school or home learning environment with multi-modal neural screening tools that identify struggles before they dictate classroom outcomes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                login('sophia@neurolearn.org', 'student');
                onEnterDashboard();
              }}
              className="glow-btn w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-900 font-bold hover:shadow-md hover:scale-102 transition-all duration-300 cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-sans">
            <span>© 2026 NeuroLearn Systems, Inc. All rights reserved.</span>
            <div className="flex space-x-4">
              <a href="#" className="hover:underline">Research Whitepaper</a>
              <a href="#" className="hover:underline">Privacy Regulation</a>
              <a href="#" className="hover:underline">Webcam Permissions Policy</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
export default LandingPage;
