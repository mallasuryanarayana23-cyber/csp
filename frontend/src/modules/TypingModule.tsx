import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Keyboard, Play, RefreshCw, CheckCircle2, ChevronRight, Sliders } from 'lucide-react';

export const TypingModule: React.FC<{ testId: string; onComplete: () => void }> = ({ testId, onComplete }) => {
  const { readingTests, addReadingTestResult, addNotification } = useStore();
  const test = readingTests.find(t => t.id === testId) || readingTests[0];

  const [inputVal, setInputVal] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Real-time tracking dynamics metrics
  const keystrokeCount = useRef(0);
  const backspaceCount = useRef(0);
  const substitutions = useRef(0);
  const hesitationTimes = useRef<number[]>([]);
  
  const startTime = useRef<number>(0);
  const lastKeyTime = useRef<number>(0);
  const keydownTimes = useRef<{ [key: string]: number }>({});
  const keyDwellTimes = useRef<{ [key: string]: number[] }>({});

  // Heatmap tracking keys
  const [hesitationMap, setHesitationMap] = useState<{ [key: string]: number }>({
    'b': 0, 'd': 0, 'p': 0, 'q': 0, 'a': 0, 'e': 0, 't': 0, 'o': 0
  });

  const handleStart = () => {
    setIsStarted(true);
    setIsCompleted(false);
    setInputVal('');
    keystrokeCount.current = 0;
    backspaceCount.current = 0;
    substitutions.current = 0;
    hesitationTimes.current = [];
    startTime.current = Date.now();
    lastKeyTime.current = Date.now();
    setHesitationMap({
      'b': 0, 'd': 0, 'p': 0, 'q': 0, 'a': 0, 'e': 0, 't': 0, 'o': 0
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isStarted || isCompleted) return;

    const now = Date.now();
    const key = e.key.toLowerCase();
    
    // Track hold duration start (keydown)
    keydownTimes.current[e.key] = now;

    // Track hesitation delay (flight time from last keypress)
    const flightTime = now - lastKeyTime.current;
    lastKeyTime.current = now;

    // Accumulate metrics if not the first stroke
    if (keystrokeCount.current > 0) {
      hesitationTimes.current.push(flightTime);
      
      // Update key-specific hesitation index for visual dashboard overlay
      if (['b', 'd', 'p', 'q', 'a', 'e', 't', 'o'].includes(key)) {
        setHesitationMap(prev => ({
          ...prev,
          [key]: Math.min(100, Math.round(prev[key] * 0.4 + flightTime * 0.6))
        }));
      }
    }

    keystrokeCount.current += 1;

    if (e.key === 'Backspace') {
      backspaceCount.current += 1;
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isStarted || isCompleted) return;
    
    const now = Date.now();
    const key = e.key.toLowerCase();
    const start = keydownTimes.current[e.key];

    if (start) {
      const dwellTime = now - start;
      if (!keyDwellTimes.current[key]) {
        keyDwellTimes.current[key] = [];
      }
      keyDwellTimes.current[key].push(dwellTime);
      delete keydownTimes.current[e.key];
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputVal(text);

    // Letter confusion cues tracker (substitution patterns: confusion with mirror symbols)
    if (text.length > inputVal.length) {
      const addedChar = text[text.length - 1].toLowerCase();
      const prevChar = text.length > 1 ? text[text.length - 2].toLowerCase() : '';
      
      if (
        (addedChar === 'd' && prevChar === 'b') || 
        (addedChar === 'b' && prevChar === 'd') ||
        (addedChar === 'q' && prevChar === 'p') ||
        (addedChar === 'p' && prevChar === 'q')
      ) {
        substitutions.current += 1;
      }
    }

    // Check completed state
    if (text.trim() === test.text.trim()) {
      setIsCompleted(true);
    }
  };

  const submitMetrics = () => {
    const elapsedSeconds = (Date.now() - startTime.current) / 1000;
    const wpm = Math.round((test.text.split(' ').length / elapsedSeconds) * 60);
    
    // Calculate rhythm consistency (standard deviation approximation of hesitations)
    const averageHesitation = hesitationTimes.current.length > 0
      ? hesitationTimes.current.reduce((a, b) => a + b, 0) / hesitationTimes.current.length
      : 250;

    // Accuracy based on backspaces and errors
    const errorCount = backspaceCount.current + substitutions.current * 2;
    const accuracy = Math.max(35, Math.min(100, Math.round(100 - (errorCount / test.text.length) * 100)));

    addReadingTestResult(
      'student-2', // Sophia Alvarez
      test.id,
      wpm,
      accuracy,
      Math.round(averageHesitation),
      backspaceCount.current > 6 ? 5 : 2, // simulated distraction events
      85 // standard speech fluency fallback
    );

    addNotification(
      'Typing Dynamics Matrix Compiled',
      `Cognitive typing test finished. WPM: ${wpm}, Accuracy: ${accuracy}%, Average hesitation interval: ${Math.round(averageHesitation)}ms.`,
      'success'
    );

    onComplete();
  };

  // Helper function to color code key hesitation values
  const getGlowStyle = (score: number) => {
    if (score > 480) return 'bg-red-500/30 border-red-500/60 text-red-300';
    if (score > 320) return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
    if (score > 120) return 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300';
    return 'bg-slate-900/60 border-white/5 text-slate-400';
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 text-left relative overflow-hidden space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani">Motor Cognitive Dynamics</span>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <span>Keystroke Rhythm Screening</span>
          </h2>
        </div>
        <div>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-white/5 text-xs text-slate-400 font-rajdhani">
            Category: {test.category}
          </span>
        </div>
      </div>

      {/* Guide overlay info */}
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed font-light">
        💡 <span className="font-semibold text-white">Interactive task:</span> Tap <span className="font-semibold">Start</span> and type the paragraph inside the test area exactly as written. The hesitation matrices below will light up in real-time mapping specific letters causing spelling or rhythm hesitations.
      </div>

      {/* Static Target Paragraph */}
      <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5 text-sm md:text-base leading-relaxed select-none">
        <span className="text-[10px] text-slate-500 uppercase block font-bold tracking-wider mb-2">Target Paragraph</span>
        <p className="text-slate-200 tracking-wide">{test.text}</p>
      </div>

      {/* Input Sandbox Board */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Rhythm Status: {isStarted ? (isCompleted ? 'Finished' : 'Recording Telemetry...') : 'Ready'}</span>
          <span>Dwell key cycles: <span className="text-indigo-400 font-bold">{keystrokeCount.current}</span></span>
        </div>
        <textarea
          value={inputVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={!isStarted || isCompleted}
          placeholder={isStarted ? "Copy the paragraph above exactly to conclude the test..." : "Click the button below to start..."}
          rows={3}
          className="w-full bg-slate-950/90 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans tracking-wide transition-colors"
        />
      </div>

      {/* Live Hesitation Delay Heatmap */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500 flex items-center space-x-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Spelling Confusion Key Heatmap</span>
          </span>
          <span className="text-[10px] text-slate-500">Color glows adjust dynamically to hold delays</span>
        </div>
        
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {Object.entries(hesitationMap).map(([key, score]) => (
            <div 
              key={key} 
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${getGlowStyle(score)}`}
            >
              <span className="text-lg font-black uppercase font-rajdhani">{key}</span>
              <span className="text-[10px] block font-semibold tracking-wider font-rajdhani mt-1">
                {score > 0 ? `${score}ms` : '0ms'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Controller Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center space-x-4">
          {!isStarted && (
            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold hover:shadow-primary-glow hover:scale-102 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Initialize Screening Test</span>
            </button>
          )}

          {isStarted && !isCompleted && (
            <button
              onClick={handleStart}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Assessment</span>
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Keystroke assessment fully captured</span>
            </div>
          )}
        </div>

        {isCompleted && (
          <button
            onClick={submitMetrics}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-sm text-white hover:shadow-accent-glow flex items-center space-x-2 cursor-pointer transition-all"
          >
            <span>Proceed to AI Scoring</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
export default TypingModule;
