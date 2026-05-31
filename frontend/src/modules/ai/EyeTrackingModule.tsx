import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Eye, CheckCircle2, ChevronRight, Video, Target, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { FaceMesh, FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';
import confetti from 'canvas-confetti';

interface EyeTrackingModuleProps {
  testId: string;
  onComplete: () => void;
}

export const EyeTrackingModule: React.FC<EyeTrackingModuleProps> = ({ testId, onComplete }) => {
  const { readingTests, addReadingTestResult, addNotification } = useStore();
  const test = readingTests.find(t => t.id === testId) || readingTests[0];

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);

  // Calibration points tracking (0: Top-Left, 1: Top-Right, 2: Bottom-Left, 3: Bottom-Right)
  const [activeCalibPoint, setActiveCalibPoint] = useState<number>(0);
  
  // Real-time screening states
  const [focusScore, setFocusScore] = useState(95);
  const [blinkCount, setBlinkCount] = useState(0);
  const [distractionEvents, setDistractionEvents] = useState(0);

  // Variables for tracking metrics across frames
  const distractionFrames = useRef(0);
  const totalFrames = useRef(0);
  const lastBlinkState = useRef(false);
  const localBlinkCounter = useRef(0);
  const localDistractionCounter = useRef(0);
  
  // Historical trail for reading fixation visualization
  const fixationPath = useRef<{x: number, y: number}[]>([]);

  // Coordinates for the 4 calibration rings inside the overlay box
  const calibCoordinates = [
    { label: 'Top-Left', x: '12%', y: '12%' },
    { label: 'Top-Right', x: '88%', y: '12%' },
    { label: 'Bottom-Left', x: '12%', y: '88%' },
    { label: 'Bottom-Right', x: '88%', y: '88%' }
  ];

  // Live video feed initialization
  const startCamera = async () => {
    setHasCameraPermission(true);
    setIsCalibrating(true);
    setActiveCalibPoint(0);
  };

  const handleNextCalibration = () => {
    // Play a quick satisfying beep or confetti flash
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { x: activeCalibPoint % 2 === 0 ? 0.2 : 0.8, y: activeCalibPoint < 2 ? 0.2 : 0.8 },
      colors: ['#06b6d4', '#6366f1']
    });

    if (activeCalibPoint < 3) {
      setActiveCalibPoint(prev => prev + 1);
    } else {
      setIsCalibrating(false);
      startGazeTracking();
    }
  };

  // Real-time computer vision FaceMesh tracker
  const startGazeTracking = () => {
    setIsFinished(false);
    setFocusScore(95);
    setBlinkCount(0);
    setDistractionEvents(0);
    distractionFrames.current = 0;
    totalFrames.current = 0;
    localBlinkCounter.current = 0;
    localDistractionCounter.current = 0;
    fixationPath.current = [];

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) return;

    // Initialize MediaPipe FaceMesh
    const faceMesh = new FaceMesh({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});
    
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // Crucial for eye centers (iris)
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    faceMesh.onResults((results) => {
      if (isFinished) return;
      totalFrames.current++;
      
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Draw video frame horizontally mirrored
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // Draw the full facial mesh for research-grade visualization
        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
            color: 'rgba(99, 102, 241, 0.15)', // Indigo 500 at 15% opacity
            lineWidth: 0.5
        });

        // --- Blink Detection (EAR - Eye Aspect Ratio) ---
        const leftEyeTop = landmarks[159];
        const leftEyeBot = landmarks[145];
        const leftEyeLeft = landmarks[33];
        const leftEyeRight = landmarks[133];
        
        const verticalDist = Math.sqrt(Math.pow(leftEyeTop.x - leftEyeBot.x, 2) + Math.pow(leftEyeTop.y - leftEyeBot.y, 2));
        const horizDist = Math.sqrt(Math.pow(leftEyeLeft.x - leftEyeRight.x, 2) + Math.pow(leftEyeLeft.y - leftEyeRight.y, 2));
        const ear = verticalDist / (horizDist + 0.0001);
        
        const isBlinking = ear < 0.15;
        if (isBlinking && !lastBlinkState.current) {
            localBlinkCounter.current++;
            setBlinkCount(localBlinkCounter.current);
        }
        lastBlinkState.current = isBlinking;

        // --- Gaze Vector (Distraction Detection) ---
        const leftIris = landmarks[468];
        const leftEyeCenter = {
            x: (leftEyeLeft.x + leftEyeRight.x) / 2,
            y: (leftEyeTop.y + leftEyeBot.y) / 2
        };
        
        const gazeDeviationX = Math.abs(leftIris.x - leftEyeCenter.x);
        const gazeDeviationY = Math.abs(leftIris.y - leftEyeCenter.y);
        
        if (gazeDeviationX > horizDist * 0.15 || gazeDeviationY > verticalDist * 0.25) {
            distractionFrames.current++;
            if (distractionFrames.current % 15 === 0) { 
                localDistractionCounter.current++;
                setDistractionEvents(localDistractionCounter.current);
            }
        }

        // Draw Iris tracking dots
        const irisX = landmarks[468].x * canvasElement.width;
        const irisY = landmarks[468].y * canvasElement.height;
        
        canvasCtx.fillStyle = '#06b6d4'; // Cyan glowing dots
        canvasCtx.beginPath();
        canvasCtx.arc(irisX, irisY, 4, 0, 2 * Math.PI);
        canvasCtx.arc(landmarks[473].x * canvasElement.width, landmarks[473].y * canvasElement.height, 4, 0, 2 * Math.PI);
        canvasCtx.fill();

        // Maintain Fixation Path Timeline (last 30 frames)
        fixationPath.current.push({ x: irisX, y: irisY });
        if (fixationPath.current.length > 30) {
            fixationPath.current.shift();
        }

        // Draw Fixation Path
        if (fixationPath.current.length > 1) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(fixationPath.current[0].x, fixationPath.current[0].y);
            for (let i = 1; i < fixationPath.current.length; i++) {
                canvasCtx.lineTo(fixationPath.current[i].x, fixationPath.current[i].y);
            }
            canvasCtx.strokeStyle = 'rgba(6, 182, 212, 0.6)'; // Cyan green
            canvasCtx.lineWidth = 2;
            canvasCtx.stroke();
        }

        // Calculate Focus Score
        const calculatedFocus = Math.max(0, 100 - (localDistractionCounter.current * 7) - (localBlinkCounter.current * 0.4));
        setFocusScore(Math.round(calculatedFocus));
      }
      canvasCtx.restore();
    });

    faceMeshRef.current = faceMesh;

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (!isFinished && faceMeshRef.current) {
            await faceMeshRef.current.send({image: videoElement});
        }
      },
      width: 640,
      height: 480
    });
    
    cameraRef.current = camera;
    camera.start();

    // Auto-conclude diagnostic test after 15 seconds
    setTimeout(() => {
      stopGazeTracking();
    }, 15000);
  };

  const stopGazeTracking = () => {
    setIsFinished(true);
    if (cameraRef.current) {
        cameraRef.current.stop();
    }
    if (faceMeshRef.current) {
        faceMeshRef.current.close();
    }
  };

  const submitGazeScore = () => {
    addReadingTestResult(
      'student-2', 
      test.id,
      76, 
      focusScore, 
      290, 
      distractionEvents,
      90 
    );

    addNotification(
      'MediaPipe Gaze Map Analyzed',
      `Attention Focus Score: ${focusScore}%. Gaze deviations detected: ${distractionEvents}.`,
      'success'
    );

    onComplete();
  };

  useEffect(() => {
    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (faceMeshRef.current) faceMeshRef.current.close();
    };
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-indigo-500/15 text-left relative overflow-hidden space-y-6">
      
      {/* Title header */}
      <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
        <div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-space">Facial Cognitive Tracking</span>
          <h2 className="text-xl font-space font-extrabold flex items-center space-x-2.5 text-slate-100">
            <Eye className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>MediaPipe Gaze WebGL Analytics</span>
          </h2>
        </div>
        <div>
          <span className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 font-space border border-indigo-500/20">
            <span>Security Sandbox Sandbox</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Left Side: Live video / canvas overlay feed */}
        <div className="md:col-span-8 bg-[#050816] rounded-2xl overflow-hidden border border-indigo-500/10 relative h-[380px] flex items-center justify-center shadow-inner">
          
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
            playsInline 
          />

          <canvas 
            ref={canvasRef} 
            width={640} 
            height={480} 
            className="absolute inset-0 w-full h-full block z-10 object-cover"
          />

          {/* 1. Camera activation overlay */}
          {!hasCameraPermission && (
            <div className="z-20 text-center space-y-4 p-4">
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Awaiting WebGL Camera Access</h4>
                <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto leading-relaxed">Webcam access is required to calibrate the 468-point facial mesh tracker.</p>
              </div>
              <button
                onClick={startCamera}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/10 transition-all cursor-pointer active:scale-98"
              >
                Activate WebGL Sensor
              </button>
            </div>
          )}

          {/* 2. Pulsing target point calibration rings */}
          {hasCameraPermission && isCalibrating && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md select-none">
              
              {/* Overlay guidelines box */}
              <div className="absolute inset-8 border border-dashed border-indigo-500/20 rounded-2xl pointer-events-none" />

              {/* Pulsing ring target */}
              <div 
                onClick={handleNextCalibration}
                className="absolute w-12 h-12 flex items-center justify-center cursor-pointer group transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: calibCoordinates[activeCalibPoint].x, 
                  top: calibCoordinates[activeCalibPoint].y 
                }}
              >
                {/* Glowing rings */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/80 animate-ping" />
                <div className="absolute inset-1.5 rounded-full border-2 border-indigo-500/60 animate-pulse" />
                <div className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/20" />
                
                {/* Clicking hints indicator */}
                <span className="absolute top-10 font-space text-[9px] font-bold text-cyan-400 whitespace-nowrap bg-slate-950/80 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                  Click Target
                </span>
              </div>

              <div className="text-center space-y-3 z-10 max-w-[280px] p-6 rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-md">
                <Target className="w-8 h-8 text-cyan-400 block mx-auto animate-pulse" />
                <h4 className="text-sm font-space font-extrabold tracking-wide text-slate-200">Gaze Calibration</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Focus on the glowing cyan target at the <span className="text-cyan-400 font-bold">{calibCoordinates[activeCalibPoint].label}</span> corner, then click it!
                </p>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest pt-1">
                  Point Alignment: {activeCalibPoint + 1} of 4
                </div>
              </div>

            </div>
          )}

          {/* 3. Capturing telemetry screen overlay */}
          {hasCameraPermission && !isCalibrating && !isFinished && (
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-semibold text-indigo-300 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>FaceMesh Mapping...</span>
            </div>
          )}

          {/* 4. Complete overlay */}
          {isFinished && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-pulse" />
              <h4 className="text-lg font-space font-extrabold text-slate-200">Gaze Mapping Concluded</h4>
              <span className="text-xs text-slate-400 font-light max-w-[260px] leading-relaxed">
                Visual focus consistency rated at <span className="text-emerald-400 font-bold">{focusScore}%</span> with {distractionEvents} distraction deviations flagged.
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Active Gaze Analytics metrics counters */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            
            <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-left">
              <div className="flex items-center justify-between mb-1.5 border-b border-indigo-500/5 pb-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-space">Attention Rating</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-space font-extrabold text-slate-100">{focusScore}%</span>
              </div>
              <span className="text-[9px] text-slate-500 block leading-tight mt-1 font-light">Calculated via eye aspects.</span>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-left">
              <div className="flex items-center justify-between mb-1.5 border-b border-indigo-500/5 pb-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-space">Attention Shifts</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-space font-extrabold text-slate-100">{distractionEvents}</span>
              </div>
              <span className="text-[9px] text-slate-500 block leading-tight mt-1 font-light">Deviations off active text.</span>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-left">
              <div className="flex items-center justify-between mb-1.5 border-b border-indigo-500/5 pb-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-space">Blink Cycles</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-space font-extrabold text-slate-100">{blinkCount}</span>
              </div>
              <span className="text-[9px] text-slate-500 block leading-tight mt-1 font-light">Measures micro eye fatigue.</span>
            </div>

          </div>

          {/* Safety disclaimers & triggers */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-yellow-500/10 bg-slate-950/30 text-[9px] text-slate-400 leading-normal flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <span>Diagnostic sessions conclude after 15s of active mapping.</span>
            </div>

            {isFinished && (
              <button
                onClick={submitGazeScore}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-xs text-white hover:shadow-lg shadow-indigo-600/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
              >
                <span>Submit Gaze Telemetry</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EyeTrackingModule;
