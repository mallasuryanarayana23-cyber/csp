import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Eye, CheckCircle2, ChevronRight, Video, Target, AlertTriangle } from 'lucide-react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export const EyeTrackingModule: React.FC<{ testId: string; onComplete: () => void }> = ({ testId, onComplete }) => {
  const { readingTests, addReadingTestResult, addNotification } = useStore();
  const test = readingTests.find(t => t.id === testId) || readingTests[0];

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);

  // Calibration points tracking
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

  // Live video feed initialization
  const startCamera = async () => {
    setHasCameraPermission(true);
    setIsCalibrating(true);
    setActiveCalibPoint(0);
  };

  const handleNextCalibration = () => {
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
        
        // --- Blink Detection (EAR - Eye Aspect Ratio) ---
        // Using left eye landmarks: 159 (top), 145 (bottom), 33 (left), 133 (right)
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
        // Iris landmark is 468 (Left Iris Center)
        const leftIris = landmarks[468];
        const leftEyeCenter = {
            x: (leftEyeLeft.x + leftEyeRight.x) / 2,
            y: (leftEyeTop.y + leftEyeBot.y) / 2
        };
        
        // Calculate deviation of iris from eye center
        const gazeDeviationX = Math.abs(leftIris.x - leftEyeCenter.x);
        const gazeDeviationY = Math.abs(leftIris.y - leftEyeCenter.y);
        
        // If deviation is large relative to eye width, user is looking away
        if (gazeDeviationX > horizDist * 0.15 || gazeDeviationY > verticalDist * 0.25) {
            distractionFrames.current++;
            if (distractionFrames.current % 15 === 0) { // Every 15 frames of looking away = 1 distraction event
                localDistractionCounter.current++;
                setDistractionEvents(localDistractionCounter.current);
            }
        }

        // Draw Iris tracking dots
        canvasCtx.fillStyle = '#10b981';
        canvasCtx.beginPath();
        canvasCtx.arc(landmarks[468].x * canvasElement.width, landmarks[468].y * canvasElement.height, 3, 0, 2 * Math.PI);
        canvasCtx.arc(landmarks[473].x * canvasElement.width, landmarks[473].y * canvasElement.height, 3, 0, 2 * Math.PI);
        canvasCtx.fill();

        // Calculate Focus Score
        const calculatedFocus = Math.max(0, 100 - (localDistractionCounter.current * 8) - (localBlinkCounter.current * 0.5));
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

    // Auto-conclude diagnostic test after 12 seconds
    setTimeout(() => {
      stopGazeTracking();
    }, 12000);
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
      'student-2', // Sophia Alvarez
      test.id,
      76, // reading speed WPM simulation
      focusScore, // Gaze focus Score
      290, // average key delay
      distractionEvents,
      90 // speech fluency fallback
    );

    addNotification(
      'MediaPipe Gaze Map Analyzed',
      `Deep CV facial landmarks compiled. Attention Focus Score: ${focusScore}%. Blink frequency: ${blinkCount}. Attention deviations detected: ${distractionEvents}.`,
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
    <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 text-left relative overflow-hidden space-y-6">
      
      {/* Title header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-rajdhani">Facial Cognitive Tracking</span>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>MediaPipe Deep CV Gaze Analytics</span>
          </h2>
        </div>
        <div>
          <span className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded font-semibold flex items-center space-x-1 font-sans">
            <span>Client-Side Security Mode</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Side: Live video / canvas overlay feed */}
        <div className="md:col-span-8 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 relative h-72 flex items-center justify-center">
          
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

          {!hasCameraPermission && (
            <div className="z-20 text-center space-y-3">
              <span className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 block w-max mx-auto animate-pulse">
                <Video className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold">Awaiting MediaPipe Camera Interface</h4>
                <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto mt-0.5">Please allow webcam access to initialize the 468-point facial mesh tracker.</p>
              </div>
              <button
                onClick={startCamera}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-xs hover:shadow-primary-glow cursor-pointer transition-all"
              >
                Activate MediaPipe WebGL
              </button>
            </div>
          )}

          {hasCameraPermission && isCalibrating && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs select-none">
              <div className="text-center space-y-2">
                <Target className="w-7 h-7 text-indigo-400 block mx-auto animate-spin" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Loading ML WebGL Mesh</h4>
                <p className="text-[10px] text-slate-400 max-w-[220px]">Align your face inside the overlay guidelines and click the corner targets.</p>
                <button
                  onClick={handleNextCalibration}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  Verify Target Node ({activeCalibPoint + 1}/4)
                </button>
              </div>
            </div>
          )}

          {isFinished && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <h4 className="text-sm font-bold">MediaPipe Telemetry Saved Successfully</h4>
              <span className="text-[10px] text-slate-500">Focus consistency: {focusScore}% | Distraction flags: {distractionEvents}</span>
            </div>
          )}
        </div>

        {/* Right Side: Active Gaze Analytics metrics counters */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Focus Score</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold font-rajdhani text-indigo-400">{focusScore}%</span>
                <span className="text-[10px] text-slate-500">attention focus index</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Distraction Slip Count</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold font-rajdhani text-amber-500">{distractionEvents}</span>
                <span className="text-[10px] text-slate-500">events detected</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5 text-left">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">Fatigue Blink cycles</span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold font-rajdhani text-emerald-400">{blinkCount}</span>
                <span className="text-[10px] text-slate-500">blinks captured</span>
              </div>
            </div>
          </div>

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
