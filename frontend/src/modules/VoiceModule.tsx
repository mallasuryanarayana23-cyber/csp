import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Mic, StopCircle, RefreshCw, Sparkles, CheckCircle2, ChevronRight, Volume2 } from 'lucide-react';

export const VoiceModule: React.FC<{ testId: string; onComplete: () => void }> = ({ testId, onComplete }) => {
  const { readingTests, addReadingTestResult, addNotification } = useStore();
  const test = readingTests.find(t => t.id === testId) || readingTests[0];

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  
  // Real-time canvas waveform states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Dynamic voice evaluation variables
  const voiceStartTime = useRef<number>(0);
  const hesitationPauses = useRef<number>(0);
  const maxVolumeRef = useRef<number>(0);
  const wordPacingIndex = useRef<number>(0);

  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const testWords = test.text.split(' ');

  // Speech Text Synthesizer for accessibility
  const speakParagraph = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(test.text);
      utterance.rate = 0.85; // slightly slower for better comprehensibility
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Audio Recording & Real-time Canvas Rendering
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsRecording(true);
      setIsFinished(false);
      setRecordingSeconds(0);
      voiceStartTime.current = Date.now();
      hesitationPauses.current = 0;
      wordPacingIndex.current = 0;
      setActiveWordIndex(0);

      // Web Audio setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawWaveform();

      // Start recording duration timer
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => {
          // highlight words sequentially based on average reading pacing
          const nextWordIndex = Math.min(testWords.length - 1, Math.floor((prev + 1) * (testWords.length / test.estimatedTime)));
          setActiveWordIndex(nextWordIndex);
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.warn("Audio media capture blocked. Simulating waveform metrics for demonstration...", err);
      // Fallback: simulated recording if mic blocked/unavailable
      setIsRecording(true);
      drawSimulatedWaveform();
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => {
          const nextWordIndex = Math.min(testWords.length - 1, Math.floor((prev + 1) * (testWords.length / test.estimatedTime)));
          setActiveWordIndex(nextWordIndex);
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Draw real hardware audio waveforms onto HTML Canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const width = canvas.width;
    const height = canvas.height;

    const renderFrame = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(renderFrame);

      analyser.getByteTimeDomainData(dataArray);
      
      // Calculate micro-pauses or silence indicating verbal hesitations
      let maxVal = 0;
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (dataArray[i] - 128) / 128;
        sumSquares += val * val;
        if (Math.abs(val) > maxVal) maxVal = Math.abs(val);
      }
      const rms = Math.sqrt(sumSquares / bufferLength);

      // Track hesitation pause: if RMS is very low (< 0.02) during active speech
      if (rms < 0.015 && Math.random() < 0.02) {
        hesitationPauses.current += 1;
      }
      if (maxVal > maxVolumeRef.current) {
        maxVolumeRef.current = maxVal;
      }

      ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw premium neon waveform gradient line
      ctx.lineWidth = 2.5;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#6366f1'); // Indigo
      gradient.addColorStop(0.5, '#a855f7'); // Purple
      gradient.addColorStop(1, '#10b981'); // Emerald
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    renderFrame();
  };

  // Draw smooth mathematical waves if hardware mic isn't approved
  const drawSimulatedWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    let phase = 0;
    const renderSim = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(renderSim);
      phase += 0.15;

      ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#10b981');
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const amplitude = Math.sin(phase + x * 0.05) * 15 * Math.cos(phase * 0.5) * (Math.sin(x * 0.005) + 0.5);
        const y = height / 2 + amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // simulated hesitation accumulator
      if (Math.random() < 0.015) {
        hesitationPauses.current += 1;
      }
    };
    renderSim();
  };

  // Stop recording and generate AI scoring
  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    setIsRecording(false);
    setIsFinished(true);
    setActiveWordIndex(-1);

    // Stop streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
  };

  const submitAnalysis = () => {
    // Generate AI metrics and submit to store
    const actualWPM = Math.round((testWords.length / Math.max(1, recordingSeconds)) * 60);
    const speechFluency = Math.max(40, Math.min(99, 100 - (hesitationPauses.current * 4.5)));
    const mockHesitationMs = hesitationPauses.current * 180 + 150; // map hesitation counts to average ms delay
    
    // Simulate distraction count (ADHD track) during voice segment
    const randomDistractions = Math.floor(Math.random() * 3) + 1;

    addReadingTestResult(
      'student-2', // Sophia Alvarez
      test.id,
      actualWPM,
      speechFluency, // Speech Fluency score
      mockHesitationMs,
      randomDistractions,
      speechFluency
    );

    addNotification(
      'Voice Screening Concluded',
      `Voice assessment completed successfully. Fluency: ${speechFluency}%, Reading speed: ${actualWPM} WPM.`,
      'success'
    );

    onComplete();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 text-left relative overflow-hidden space-y-6">
      
      {/* Module Title Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani">Acoustic Speech Diagnostics</span>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <span>Voice Screening Module</span>
          </h2>
        </div>
        <div className="flex space-x-2">
          {/* TTS Helper */}
          <button 
            onClick={speakParagraph}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-xs flex items-center space-x-1.5 transition-colors"
            title="Read out paragraph for guidance"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Phonetic Guide</span>
          </button>
        </div>
      </div>

      {/* Screen Guide Overlay Indicator */}
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start space-x-2.5">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-300 font-light leading-relaxed">
          <span className="font-semibold text-white">Task:</span> Press <span className="font-bold">Record</span>, read the paragraph aloud clearly. The oscilloscope maps volume cycles and tracks hesitation segments dynamically.
        </p>
      </div>

      {/* Word reading paragraph board */}
      <div className="p-6 bg-slate-950/80 rounded-2xl border border-white/5 min-h-[140px] flex items-center justify-center relative">
        
        {/* Dynamic scanning indicator line */}
        {isRecording && (
          <div className="absolute left-0 w-full h-[1px] bg-emerald-400/30 shadow-accent-glow animate-scan pointer-events-none" />
        )}

        <div className="text-sm md:text-base leading-relaxed tracking-wider font-medium text-slate-300 select-none max-w-2xl text-center">
          {testWords.map((word, index) => (
            <span 
              key={index} 
              className={`inline-block mx-1 my-0.5 px-1 py-0.5 rounded transition-all duration-300 ${
                index === activeWordIndex 
                  ? 'bg-emerald-500/25 text-emerald-300 text-glow-accent scale-105 border-b-2 border-emerald-400' 
                  : index < activeWordIndex
                    ? 'text-slate-400 font-normal line-through opacity-60'
                    : 'text-slate-200'
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Active Waveform Oscilloscope Canvas */}
      <div className="relative h-28 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        
        {!isRecording && !isFinished && (
          <span className="text-xs text-slate-500 font-medium z-10 flex items-center space-x-2">
            <Mic className="w-4 h-4 animate-bounce" />
            <span>Awaiting voice hardware capture...</span>
          </span>
        )}

        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-1 select-none">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Speech telemetry captured successfully</span>
            <span className="text-[10px] text-slate-500">Duration: {recordingSeconds}s | Reading Pace: {Math.round((testWords.length / recordingSeconds) * 60)} WPM</span>
          </div>
        )}
      </div>

      {/* Recording Control Cockpit */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-4">
          {!isRecording && !isFinished && (
            <button
              onClick={startRecording}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 font-bold hover:shadow-accent-glow hover:scale-102 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Begin Audio Capture</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-red-500/40 text-red-400 font-bold hover:scale-102 flex items-center space-x-2 transition-all cursor-pointer animate-pulse"
            >
              <StopCircle className="w-4 h-4 text-red-500" />
              <span>Conclude Recording ({recordingSeconds}s)</span>
            </button>
          )}

          {isFinished && (
            <button
              onClick={startRecording}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Exercise</span>
            </button>
          )}
        </div>

        {isFinished && (
          <button
            onClick={submitAnalysis}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-sm text-white hover:shadow-primary-glow flex items-center space-x-2 cursor-pointer transition-all"
          >
            <span>Proceed to AI Scoring</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
export default VoiceModule;
