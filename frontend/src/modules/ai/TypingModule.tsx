import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Keyboard, Play, RefreshCw, CheckCircle2, ChevronRight, Sliders, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TypingModuleProps {
  testId: string;
  onComplete: () => void;
}

export const TypingModule: React.FC<TypingModuleProps> = ({ testId, onComplete }) => {
  const { readingTests, addReadingTestResult, addNotification, user } = useStore();
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

  // Full letter hesitation map tracking for standard keyboard
  const [hesitationMap, setHesitationMap] = useState<{ [key: string]: number }>({
    q: 0, w: 0, e: 0, r: 0, t: 0, y: 0, u: 0, i: 0, o: 0, p: 0,
    a: 0, s: 0, d: 0, f: 0, g: 0, h: 0, j: 0, k: 0, l: 0,
    z: 0, x: 0, c: 0, v: 0, b: 0, n: 0, m: 0
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
    
    // Reset full hesitation map
    setHesitationMap({
      q: 0, w: 0, e: 0, r: 0, t: 0, y: 0, u: 0, i: 0, o: 0, p: 0,
      a: 0, s: 0, d: 0, f: 0, g: 0, h: 0, j: 0, k: 0, l: 0,
      z: 0, x: 0, c: 0, v: 0, b: 0, n: 0, m: 0
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
      
      // Update key-specific hesitation index for QWERTY heatmap
      if (key in hesitationMap) {
        setHesitationMap(prev => ({
          ...prev,
          [key]: Math.min(1000, Math.round(prev[key] * 0.3 + flightTime * 0.7))
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
    
    // Limit input length to target text length to prevent typing past limits
    if (text.length > test.text.length) return;
    
    setInputVal(text);

    // Letter confusion cues tracker (substitution patterns: mirror swaps like b/d, p/q)
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
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#a855f7']
      });
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

    // Calculate real focus deviations (lapses in typing focus > 1600ms)
    const realDistractions = hesitationTimes.current.filter(t => t > 1600).length;

    // Determine target student profile id
    const studentProfileId = 'student-2'; // Default matching Sophia Alvarez or first student profile

    addReadingTestResult(
      studentProfileId,
      test.id,
      wpm,
      accuracy,
      Math.round(averageHesitation),
      realDistractions,
      82
    );

    addNotification(
      'Typing Dynamics Compiled',
      `Cognitive typing test finished. Speed: ${wpm} WPM, Rhythm Consistency: ${accuracy}%, Average hesitation interval: ${Math.round(averageHesitation)}ms.`,
      'success'
    );

    onComplete();
  };

  // QWERTY keyboard layout rows
  const qwertyRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  // Helper function to color code key hesitation values (warm heatmaps)
  const getKeycapGlow = (key: string) => {
    const score = hesitationMap[key] || 0;
    if (score === 0) return 'bg-slate-900/60 border-slate-800 text-slate-500';
    if (score > 600) return 'bg-rose-500/35 border-rose-500/60 text-rose-200 text-shadow shadow-lg shadow-rose-500/10 scale-102';
    if (score > 350) return 'bg-amber-500/25 border-amber-500/50 text-amber-200';
    if (score > 150) return 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300';
    return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300';
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-indigo-500/15 text-left relative overflow-hidden space-y-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-space">Motor Cognitive Dynamics</span>
          <h2 className="text-xl font-space font-extrabold flex items-center space-x-2.5">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <span>Keystroke Rhythm Screening</span>
          </h2>
        </div>
        <div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-900 text-[10px] font-bold text-slate-400 font-space uppercase">
            {test.difficulty} Rating
          </span>
        </div>
      </div>

      {/* Guide overlay info */}
      <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[11px] text-indigo-300 leading-relaxed font-light">
        💡 <span className="font-bold text-white">Interactive Sandbox Test:</span> Click <span className="font-bold text-indigo-300">Initialize Test</span> below and start copy-typing the paragraph inside the test area. Character-by-character indicators will highlight matching keys in <span className="text-emerald-400 font-bold">green</span> or spelling errors in <span className="text-rose-400 font-bold">red</span>. Heatmap overlays reflect motor hesitations!
      </div>

      {/* Interactive Paragraph display with Monkeytype-style highlight overlays */}
      <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-900 text-sm md:text-base leading-relaxed select-none relative">
        <span className="text-[9px] text-slate-500 uppercase block font-extrabold tracking-widest mb-3">Target Paragraph Reader</span>
        <div className="font-sans tracking-wide text-slate-400 whitespace-pre-wrap select-none relative min-h-[60px]">
          {test.text.split('').map((char, index) => {
            const typedChar = inputVal[index];
            let charClass = 'text-slate-500'; // untyped
            
            if (typedChar !== undefined) {
              charClass = typedChar === char ? 'text-emerald-400 font-bold bg-emerald-500/5' : 'text-rose-400 font-bold bg-rose-500/10 line-through';
            }

            const isCurrent = index === inputVal.length;
            
            return (
              <span key={index} className={`${charClass} transition-colors duration-150 relative`}>
                {char}
                {isCurrent && isStarted && !isCompleted && (
                  <span className="absolute bottom-0 left-0 w-[2px] h-[1em] bg-indigo-500 animate-pulse inline-block" style={{ width: '2px' }} />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Input Sandbox Board Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-bold uppercase tracking-wider">
          <span>Rhythm Status: {isStarted ? (isCompleted ? 'Finished' : 'Recording Telemetry...') : 'Ready'}</span>
          <span>keystroke indices: <span className="text-indigo-400 font-bold">{keystrokeCount.current} Strokes</span></span>
        </div>
        <textarea
          value={inputVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={!isStarted || isCompleted}
          placeholder={isStarted ? "Copy the paragraph above exactly to conclude the test..." : "Click the button below to start..."}
          rows={3}
          className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-slate-200 placeholder-slate-700 font-sans tracking-wide transition-all outline-none"
        />
      </div>

      {/* QWERTY key hesitation heatmap overlays */}
      <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-900 rounded-2xl">
        <div className="flex items-center justify-between border-b border-indigo-500/5 pb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center space-x-1.5 font-space">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>QWERTY Motor Hesitation Heatmap</span>
          </span>
          <span className="text-[9px] text-slate-500">Lights up in red/amber upon keyboard hold delays</span>
        </div>
        
        {/* Virtual Keyboard rendering */}
        <div className="flex flex-col space-y-2 max-w-lg mx-auto py-2">
          {qwertyRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center space-x-1.5">
              {rIdx === 1 && <div className="w-2" />} {/* Indentation for home row */}
              {rIdx === 2 && <div className="w-4" />} {/* Indentation for bottom row */}
              {row.map((key) => {
                const isHesitationKey = hesitationMap[key] > 0;
                return (
                  <div 
                    key={key} 
                    className={`w-8 h-9 sm:w-10 sm:h-11 rounded-lg border flex flex-col items-center justify-center transition-all duration-350 ${getKeycapGlow(key)}`}
                  >
                    <span className="text-[10px] sm:text-xs font-black uppercase font-space select-none">{key}</span>
                    {isHesitationKey && (
                      <span className="text-[6px] sm:text-[7px] font-bold block scale-90 leading-none select-none">
                        {hesitationMap[key]}ms
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Action Controller Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-indigo-500/10">
        <div className="flex items-center space-x-4">
          {!isStarted && (
            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold hover:shadow-md hover:scale-102 flex items-center space-x-2 transition-all cursor-pointer text-white"
            >
              <span>Initialize Screening Test</span>
            </button>
          )}

          {isStarted && !isCompleted && (
            <button
              onClick={handleStart}
              className="px-4.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Assessment</span>
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Keystroke metrics successfully mapped</span>
            </div>
          )}
        </div>

        {isCompleted && (
          <button
            onClick={submitMetrics}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs text-white hover:shadow-md flex items-center space-x-2 cursor-pointer transition-all active:scale-98"
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
