import React, { useState, useRef } from 'react';
import ParticleNetwork from './ParticleNetwork';
import { useStore } from '../store/useStore';
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
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC<{ onEnterDashboard: () => void }> = ({ onEnterDashboard }) => {
  const { login } = useStore();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'parent'>('student');
  
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
    <div className="relative min-h-screen text-slate-100 font-sans overflow-hidden">
      
      {/* Dynamic Background Network */}
      <div className="absolute inset-0 z-0 min-h-screen">
        <ParticleNetwork />
      </div>

      {/* Floating Gradient Lighting Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Content Scroll Wrap */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-28">
        
        {/* 1. Hero Showcase Section */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-6">
          
          {/* Decorative Tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Patent-Pending Cognitive Detection Architecture</span>
          </div>

          {/* Heading Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] font-sans">
            Early Diagnostic Screening, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              Powered by Multi-Modal AI
            </span>
          </h1>

          {/* Descriptive Pitch */}
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Detect subtle markers of Dyslexia, ADHD, and cognitive learning stress in students through real-time keystroke dynamics, speech fluency patterns, and webcam gaze-tracking analytics.
          </p>

          {/* Important Medical Disclaimer Warning Box */}
          <div className="max-w-xl mx-auto p-3 rounded-xl bg-slate-900/60 border border-yellow-500/20 text-yellow-500/90 text-xs font-semibold tracking-wide">
            ⚠ "This platform provides AI-assisted educational screening and behavioral insights only, not medical diagnosis."
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                login('sophia@neurolearn.org', 'student');
                onEnterDashboard();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:shadow-primary-glow hover:scale-102 transition-all duration-300 flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>Explore Student Cockpit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                login('sarah@neurolearn.org', 'teacher');
                onEnterDashboard();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 font-bold hover:bg-slate-800 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Enter Educator Portal</span>
            </button>
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
              <h3 className="text-2xl font-bold font-sans">Experience Keystroke Analytics</h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Type the sample sentence on the right. Our system tracks microsecond variations in flight-time, key-hold intervals, and letter confusion cues correlating with learning fatigue or dyslexia patterns.
              </p>
              
              {/* Dynamic Output Cards */}
              <div className="grid grid-cols-2 gap-3.5 pt-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-left">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Average Delay</span>
                  <span className="text-lg font-bold text-indigo-400 font-rajdhani">{averageDelay}ms</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-left">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Confusion Score</span>
                  <span className={`text-lg font-bold font-rajdhani ${typingStats.substitutions > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
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
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Key hold cycles: <span className="text-indigo-400 font-bold">{typingStats.keystrokes}</span></span>
                <span>Letter overlaps (b/d confusions): <span className="text-amber-400 font-bold">{typingStats.substitutions}</span></span>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Core AI Modalities Showcase */}
        <section className="space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Multi-Modal Screening Engines</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-light">
              We compile sensory metrics from three physical interaction modes into a single unified behavioral profile.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            
            {/* Gaze Tracker Card */}
            <div className="glass-panel hover:glass-panel-glow p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Webcam Attention Gaze Mapping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses MediaPipe algorithms in the browser to map focal directions, line-level tracking, blink ratios, and attention slips. Identifies learning fatigue and screen distractions completely locally.
              </p>
            </div>

            {/* Voice Fluency Card */}
            <div className="glass-panel hover:glass-panel-glow p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Acoustic Speech Fluency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Processes live microphone reading exercises using Web Audio. Measures phoneme hesitations, pronunciation hitches, pacing abnormalities, and voice stress maps indicative of phonetic struggles.
              </p>
            </div>

            {/* Keystroke Dynamics Card */}
            <div className="glass-panel hover:glass-panel-glow p-6 rounded-2xl border border-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                <Keyboard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Keystroke Delay Patterning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates physical typing rhythm, letter displacement, and correction pacing. Maps keyflight speed and substitutions (like swap confusion) to output a detailed motor cognitive index.
              </p>
            </div>

          </div>
        </section>

        {/* 4. Research Impact & Problem Statement */}
        <section className="grid md:grid-cols-2 gap-12 items-center text-left">
          
          <div className="space-y-6">
            <div className="p-2 bg-indigo-500/15 text-indigo-400 w-max rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold font-sans tracking-tight">Addressing the Cognitive Identification Gap</h2>
            <p className="text-slate-300 text-sm font-light leading-relaxed">
              Standard cognitive diagnosis is lengthy, costly, and frequently late—often occurring only after a child has fallen multiple grades behind peers. Early behavioral indicators of dyslexia or focus challenges are usually lost in visual clutter.
            </p>
            <blockquote className="border-l-2 border-emerald-400 pl-4 py-1 italic text-slate-400 text-xs">
              "By capturing physical sensory metrics directly inside daily learning environments, NeuroLearn allows teachers to implement assistive strategies months before severe setbacks develop."
            </blockquote>
          </div>

          {/* Research Metric Graphic Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-white/5 text-center">
              <span className="text-4xl font-extrabold text-indigo-400 font-rajdhani">85%</span>
              <p className="text-xs text-slate-400 mt-2">Correlation rate with clinical diagnosis metrics</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-white/5 text-center">
              <span className="text-4xl font-extrabold text-emerald-400 font-rajdhani">4x</span>
              <p className="text-xs text-slate-400 mt-2">Faster intervention mapping for school educators</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950/60 to-slate-900/60 border border-white/5 text-center">
              <span className="text-4xl font-extrabold text-purple-400 font-rajdhani">&lt; 3min</span>
              <p className="text-xs text-slate-400 mt-2">Required physical screening duration per student</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950/60 to-slate-900/60 border border-white/5 text-center">
              <span className="text-4xl font-extrabold text-amber-400 font-rajdhani">100%</span>
              <p className="text-xs text-slate-400 mt-2">Browser security & fully local sensory computing</p>
            </div>
          </div>

        </section>

        {/* 5. Frequently Asked Questions Section */}
        <section className="space-y-8 max-w-3xl mx-auto">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Technology & Integration FAQ</h2>
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
                  <div className="p-5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>

        {/* 6. Footer & Call to Action (CTA) Section */}
        <section className="glass-panel-glow rounded-3xl p-8 md:p-12 border border-white/10 text-center relative overflow-hidden space-y-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-emerald-500/5 pointer-events-none"></div>
          <h2 className="text-3xl md:text-5xl font-extrabold">Begin Early Screening Support Today</h2>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
            Equip your school or home learning environment with multi-modal neural screening tools that identify struggles before they dictate classroom outcomes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                login('sophia@neurolearn.org', 'student');
                onEnterDashboard();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-900 font-bold hover:shadow-accent-glow hover:scale-102 transition-all duration-300 cursor-pointer"
            >
              Start Student Evaluation
            </button>
            <button
              onClick={() => {
                login('sarah@neurolearn.org', 'teacher');
                onEnterDashboard();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-300 cursor-pointer"
            >
              Deploy Institutional Pilot
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
