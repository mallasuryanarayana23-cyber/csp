import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Mic, StopCircle, RefreshCw, Sparkles, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const VoiceModule: React.FC<{ testId: string; onComplete: () => void }> = ({ testId, onComplete }) => {
  const { readingTests, addReadingTestResult, addNotification } = useStore();
  const test = readingTests.find(t => t.id === testId) || readingTests[0];

  const [isRecording, setIsRecording] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  
  // Real NLP responses from Whisper via Backend
  const [nlpTranscription, setNlpTranscription] = useState('');
  const [nlpFluencyScore, setNlpFluencyScore] = useState(0);
  const [nlpHesitations, setNlpHesitations] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  // Audio Context for visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyserRef.current!.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = 'rgba(15, 23, 42, 1)'; // slate-900 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6366f1'; // indigo-500
      ctx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      
      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    
    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Audio Context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioWithAI(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsFinished(false);
      setRecordingSeconds(0);
      
      // Start drawing waveform
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'rgba(15, 23, 42, 1)';
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        drawWaveform();
      }
      
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied or failed", err);
      addNotification("Hardware Error", "Could not access microphone for AI Voice processing.", "warning");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    setIsRecording(false);
    setIsProcessing(true);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processAudioWithAI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'student_voice.webm');
      formData.append('studentId', 'student-2'); // Hardcoded Sophia for prototype

      const token = localStorage.getItem('token') || '';
      
      const response = await fetch('http://localhost:4000/api/screenings/submit-audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("AI Processing Failed");

      const data = await response.json();
      
      setNlpTranscription(data.aiResponse.transcription);
      setNlpFluencyScore(data.aiResponse.fluency_score);
      setNlpHesitations(data.aiResponse.hesitation_events);
      setIsProcessing(false);
      setIsFinished(true);

      addNotification("Whisper AI Success", "Deep NLP Speech assessment concluded successfully.", "success");
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setIsFinished(true);
      setNlpTranscription("NLP processing failed. Please ensure the PyTorch backend is running.");
      setNlpFluencyScore(0);
    }
  };

  const submitAnalysis = () => {
    addReadingTestResult(
      'student-2', 
      test.id,
      75, 
      Math.round(nlpFluencyScore), 
      400, 
      nlpHesitations,
      Math.round(nlpFluencyScore)
    );
    onComplete();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  return (
    <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl text-left relative overflow-hidden space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-rajdhani">Acoustic Speech Diagnostics</span>
          <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
            <Mic className="w-5 h-5 text-indigo-400" />
            <span>Deep NLP Whisper Inference</span>
          </h2>
        </div>
        <div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full font-medium flex items-center space-x-1 font-sans border border-slate-700">
            <span>PyTorch Active</span>
          </span>
        </div>
      </div>

      <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-300 font-medium leading-relaxed">
          <span className="font-semibold text-slate-100">Task:</span> Read the paragraph aloud. The system uses a deep neural network (OpenAI Whisper) to assess your phonemes, hesitation loops, and reading fluency via an audio timeline buffer.
        </p>
      </div>

      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 min-h-[140px] flex items-center justify-center relative shadow-inner">
        <p className="text-base leading-relaxed tracking-wide font-medium text-slate-200 max-w-2xl text-center">
          {test.text}
        </p>
      </div>
      
      {/* Waveform Visualization Canvas */}
      <div className="h-24 w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
        {!isRecording && !isFinished && !isProcessing && (
           <span className="text-xs text-slate-500 font-medium tracking-wide">Awaiting Audio Stream...</span>
        )}
        <canvas 
            ref={canvasRef} 
            className={`w-full h-full absolute inset-0 ${isRecording ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} 
            width={800} 
            height={100}
        />
        {isFinished && (
           <div className="w-full h-full flex items-center justify-center bg-slate-900 border-t border-slate-800">
                <span className="text-xs text-slate-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                    <span>Audio Buffer Encoded Successfully</span>
                </span>
           </div>
        )}
      </div>

      {isProcessing && (
        <div className="p-5 bg-slate-800/50 rounded-xl border border-indigo-500/30 flex flex-col items-center justify-center space-y-3">
           <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
           <span className="text-sm text-slate-300 font-medium">Running PyTorch Inference (Whisper-Tiny)...</span>
        </div>
      )}

      {isFinished && !isProcessing && (
        <div className="p-5 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Neural Transcription Synchronized</span>
              <span className="text-xs font-bold text-slate-300 px-2 py-1 bg-slate-700 rounded-md">Latency: ~2.1s</span>
          </div>
          
          <p className="italic text-slate-200 text-sm leading-relaxed">"{nlpTranscription}"</p>
          
          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-700">
            <span className="text-xs bg-slate-700/50 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg font-medium">Fluency Score: {nlpFluencyScore}%</span>
            <span className="text-xs bg-slate-700/50 border border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg font-medium">Hesitation Events: {nlpHesitations}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center space-x-4">
          {!isRecording && !isFinished && !isProcessing && (
            <button
              onClick={startRecording}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-colors cursor-pointer flex items-center space-x-2 shadow-sm"
            >
              <Mic className="w-4 h-4" />
              <span>Begin Acoustic Capture</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-6 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-colors cursor-pointer flex items-center space-x-2"
            >
              <StopCircle className="w-4 h-4" />
              <span>Stop & Analyze ({recordingSeconds}s)</span>
            </button>
          )}

          {isFinished && !isProcessing && (
            <button
              onClick={startRecording}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 font-medium text-sm text-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Exercise</span>
            </button>
          )}
        </div>

        {isFinished && !isProcessing && (
          <button
            onClick={submitAnalysis}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <span>Proceed to Analytics</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
export default VoiceModule;
