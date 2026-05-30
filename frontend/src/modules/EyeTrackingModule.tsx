import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Eye, ShieldCheck, CheckCircle2, ChevronRight, Video, Target, AlertTriangle } from 'lucide-react';

export const EyeTrackingModule: React.FC<{ testId: string; onComplete: () => void }> = ({ testId, onComplete }) => {
  const { readingTests, addReadingTestResult, addNotification } = useStore();
  const test = readingTests.find(t => t.id === testId) || readingTests[0];

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Calibration points tracking
  const [activeCalibPoint, setActiveCalibPoint] = useState<number>(0); // 0-3 calibration corners
  
  // Real-time screening states
  const [focusScore, setFocusScore] = useState(95);
  const [blinkCount, setBlinkCount] = useState(0);
  const [distractionEvents, setDistractionEvents] = useState(0);

  // Live video feed initialization
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsCalibrating(true);
      setActiveCalibPoint(0);
    } catch (err) {
      console.warn("Webcam blocked or unavailable. Simulating gaze telemetry points...", err);
      // Fallback: simulated flow if permission denied
      setHasCameraPermission(true);
      setIsCalibrating(true);
      setActiveCalibPoint(0);
    }
  };

  const handleNextCalibration = () => {
    if (activeCalibPoint < 3) {
      setActiveCalibPoint(prev => prev + 1);
    } else {
      setIsCalibrating(false);
      // Begin active screening gaze drawing loop
      startGazeTracking();
    }
  };

  const startGazeTracking = () => {
    setIsFinished(false);
    setFocusScore(95);
    setBlinkCount(0);
    setDistractionEvents(0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let focus = 95;
    let blinks = 0;
    let distractions = 0;

    const renderLoop = () => {
      frame++;
      animationFrameRef.current = requestAnimationFrame(renderLoop);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw horizontal scanning reading bounds
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Math vectors to simulate active facial contour points and gaze vectors
      const eyeL_x = width / 2 - 40 + Math.sin(frame * 0.03) * 6;
      const eyeL_y = height / 2 - 20 + Math.cos(frame * 0.02) * 3;
      const eyeR_x = width / 2 + 40 + Math.sin(frame * 0.03) * 6;
      const eyeR_y = height / 2 - 20 + Math.cos(frame * 0.02) * 3;

      // Simulate blink cycles occasionally
      const isBlinking = frame % 110 < 8;
      if (frame % 110 === 8) {
        blinks += 1;
        setBlinkCount(blinks);
      }

      // Draw focus direction vectors
      const gazeDev_x = Math.sin(frame * 0.025) * 22;
      const gazeDev_y = Math.cos(frame * 0.015) * 15;

      // Simulate a distraction event if gaze leaves standard boundary box
      const isDistracted = Math.abs(gazeDev_x) > 18 && frame % 130 < 25;
      if (isDistracted && frame % 130 === 1) {
        distractions += 1;
        setDistractionEvents(distractions);
      }

      // Update focus score
      focus = Math.max(30, Math.min(99, Math.round(98 - (distractions * 7.5) - (isDistracted ? 15 : 0))));
      setFocusScore(focus);

      // Render overlay shapes on canvas
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(40, height - 45, width - 80, 5); // bottom focus timeline guideline

      // Render facial mapping coordinates dots
      ctx.fillStyle = isDistracted ? '#f59e0b' : '#10b981';
      
      // Eyes outline
      ctx.beginPath();
      if (isBlinking) {
        // closed flat lines
        ctx.moveTo(eyeL_x - 12, eyeL_y); ctx.lineTo(eyeL_x + 12, eyeL_y);
        ctx.moveTo(eyeR_x - 12, eyeR_y); ctx.lineTo(eyeR_x + 12, eyeR_y);
      } else {
        // circles
        ctx.arc(eyeL_x, eyeL_y, 8, 0, Math.PI * 2);
        ctx.arc(eyeR_x, eyeR_y, 8, 0, Math.PI * 2);
      }
      ctx.strokeStyle = isDistracted ? '#f59e0b' : '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Render iris focal vector line
      if (!isBlinking) {
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(eyeL_x + (gazeDev_x * 0.2), eyeL_y + (gazeDev_y * 0.2), 3.5, 0, Math.PI * 2);
        ctx.arc(eyeR_x + (gazeDev_x * 0.2), eyeR_y + (gazeDev_y * 0.2), 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw gaze mapping vector trace line
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2 + 10);
        ctx.lineTo(width / 2 + gazeDev_x * 4, height / 2 - 30 + gazeDev_y * 4);
        ctx.strokeStyle = isDistracted ? 'rgba(245, 158, 11, 0.45)' : 'rgba(99, 102, 241, 0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Render nose & face coordinate dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const facePoints = [
        { x: width / 2 + Math.sin(frame * 0.03) * 5, y: height / 2 + 10 }, // nose
        { x: width / 2 - 25, y: height / 2 + 35 }, // mouth L
        { x: width / 2 + 25, y: height / 2 + 35 }, // mouth R
        { x: width / 2, y: height / 2 + 45 } // chin
      ];
      facePoints.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    renderLoop();

    // Auto-complete evaluation after 12 seconds to fit standard diagnostic screening
    setTimeout(() => {
      stopGazeTracking();
    }, 12000);
  };

  const stopGazeTracking = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsFinished(true);

    // Stop camera feed
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const submitGazeScore = () => {
    addReadingTestResult(
      'student-2', // Sophia Alvarez
      test.id,
      76, // reading speed WPM simulation
      focusScore, // Gaze focus Score
      290, // average key delay
      distractionEvents,
      90 // speech fluency fallback
    );

    addNotification(
      'Webcam Gaze Map Analyzed',
      `Eye-gaze calibration metrics compiled. Attention Focus Score: ${focusScore}%. Blink frequency: ${blinkCount} bpm. Attention deviations detected: ${distractionEvents}.`,
      'success'
    );

    onComplete();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 text-left relative overflow-hidden space-y-6">
      
      {/* Title header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani">Facial Cognitive Tracking</span>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>Webcam Gaze Analytics Simulator</span>
          </h2>
        </div>
        <div>
          <span className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded font-semibold flex items-center space-x-1 font-sans">
            <span>Client-Side Security Mode</span>
          </span>
        </div>
      </div>

      {/* Guide Info */}
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed font-light">
        🔒 <span className="font-semibold text-white">Privacy Guarantee:</span> Camera feeds are fully processed locally inside your web browser canvas sandbox. No video bytes are ever cached, stored, or transmitted over network sockets.
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Left Side: Live video / canvas overlay feed */}
        <div className="md:col-span-8 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 relative h-72 flex items-center justify-center">
          
          {/* Real video tag element */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-35 z-0 transform -scale-x-100"
          />

          {/* Active vector canvas overlays */}
          <canvas 
            ref={canvasRef} 
            width={640} 
            height={480} 
            className="absolute inset-0 w-full h-full block z-10 transform -scale-x-100"
          />

          {/* 1. Camera activation view */}
          {!hasCameraPermission && (
            <div className="z-20 text-center space-y-3">
              <span className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 block w-max mx-auto animate-pulse">
                <Video className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold">Awaiting Camera Interface</h4>
                <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto mt-0.5">Please allow webcam access inside your browser permissions panel.</p>
              </div>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-xs hover:shadow-primary-glow cursor-pointer transition-all"
              >
                Activate Webcam Interface
              </button>
            </div>
          )}

          {/* 2. Corners Calibration Screen overlays */}
          {hasCameraPermission && isCalibrating && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs select-none">
              
              <div className="text-center space-y-2">
                <Target className="w-7 h-7 text-indigo-400 block mx-auto animate-spin" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Webcam Calibration active</h4>
                <p className="text-[10px] text-slate-400 max-w-[220px]">Align your face inside the overlay guidelines and click the corner targets.</p>
                <button
                  onClick={handleNextCalibration}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  Verify Target Node ({activeCalibPoint + 1}/4)
                </button>
              </div>

              {/* Calibration Nodes position maps */}
              <div className={`absolute w-5 h-5 rounded-full border-2 border-emerald-400 bg-emerald-500/20 animate-ping cursor-pointer ${
                activeCalibPoint === 0 ? 'top-4 left-4' :
                activeCalibPoint === 1 ? 'top-4 right-4' :
                activeCalibPoint === 2 ? 'bottom-4 left-4' : 'bottom-4 right-4'
              }`} />
            </div>
          )}

          {/* 3. Screening complete status board */}
          {isFinished && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <h4 className="text-sm font-bold">Gaze Telemetry Saved Successfully</h4>
              <span className="text-[10px] text-slate-500">Focus consistency: {focusScore}% | Distraction flags: {distractionEvents}</span>
            </div>
          )}

        </div>

        {/* Right Side: Active Gaze Analytics metrics counters */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          
          <div className="space-y-3.5">
            {/* Live Focus Score Tracker */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Focus Score</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${focusScore > 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {focusScore > 75 ? 'Excellent' : 'Focus Slip'}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold font-rajdhani text-indigo-400">{focusScore}%</span>
                <span className="text-[10px] text-slate-500">attention focus index</span>
              </div>
            </div>

            {/* Distraction Alerts Indicator */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Distraction Slip Count</span>
                {distractionEvents > 2 && (
                  <span className="text-red-400 animate-pulse text-[10px] font-semibold flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Focus Drift</span>
                  </span>
                )}
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold font-rajdhani text-amber-500">{distractionEvents}</span>
                <span className="text-[10px] text-slate-500">events detected</span>
              </div>
            </div>

            {/* Fatigue Blink Meter */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Fatigue Blink cycles</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold font-rajdhani text-emerald-400">{blinkCount}</span>
                <span className="text-[10px] text-slate-500">blinks captured</span>
              </div>
            </div>
          </div>

          {/* Action completion triggers */}
          {isFinished && (
            <button
              onClick={submitGazeScore}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 font-bold text-xs text-white hover:shadow-accent-glow cursor-pointer transition-all flex items-center justify-center space-x-2"
            >
              <span>Verify & Save Gaze Session</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
export default EyeTrackingModule;
