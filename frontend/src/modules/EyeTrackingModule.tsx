import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Eye, CheckCircle2, ChevronRight, Video, Target } from 'lucide-react';
import { FaceMesh, FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors } from '@mediapipe/drawing_utils';

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
  
  // Historical trail for reading fixation visualization
  const fixationPath = useRef<{x: number, y: number}[]>([]);

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
            color: 'rgba(99, 102, 241, 0.2)', // Indigo 500 at 20% opacity
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
        
        canvasCtx.fillStyle = '#10b981';
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
            canvasCtx.strokeStyle = 'rgba(16, 185, 129, 0.6)'; // Emerald green
            canvasCtx.lineWidth = 2;
            canvasCtx.stroke();
        }

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
      `Attention Focus Score: ${focusScore}%. Blink frequency: ${blinkCount}. Attention deviations detected: ${distractionEvents}.`,
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
    <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl text-left relative overflow-hidden space-y-6">
      
      {/* Title header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-rajdhani">Facial Cognitive Tracking</span>
          <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-100">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>MediaPipe Live CV Analytics</span>
          </h2>
        </div>
        <div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full font-medium flex items-center space-x-1 font-sans border border-slate-700">
            <span>Enterprise Security Mode</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Side: Live video / canvas overlay feed */}
        <div className="md:col-span-8 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative h-[360px] flex items-center justify-center shadow-inner">
          
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
            <div className="z-20 text-center space-y-4">
              <span className="p-4 rounded-full bg-slate-800 text-slate-400 block w-max mx-auto border border-slate-700">
                <Video className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Awaiting MediaPipe Initialization</h4>
                <p className="text-[11px] text-slate-500 max-w-[280px] mx-auto mt-1 leading-relaxed">Webcam access is required to initialize the 468-point facial mesh tracker.</p>
              </div>
              <button
                onClick={startCamera}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-colors shadow-sm"
              >
                Activate WebGL Sensor
              </button>
            </div>
          )}

          {hasCameraPermission && isCalibrating && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm select-none">
              <div className="text-center space-y-3">
                <Target className="w-8 h-8 text-indigo-400 block mx-auto" />
                <h4 className="text-sm font-bold tracking-wide text-slate-200">Calibrating Facial Mesh</h4>
                <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">Align your face inside the overlay guidelines and hold still.</p>
                <button
                  onClick={handleNextCalibration}
                  className="px-5 py-2 rounded-lg bg-slate-800 text-white font-medium text-xs hover:bg-slate-700 border border-slate-600 transition-colors mt-2"
                >
                  Verify Target Node ({activeCalibPoint + 1}/4)
                </button>
              </div>
            </div>
          )}

          {isFinished && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <h4 className="text-base font-bold text-slate-200">Session Telemetry Finalized</h4>
              <span className="text-xs text-slate-400">Focus consistency: {focusScore}% | Distraction flags: {distractionEvents}</span>
            </div>
          )}
        </div>

        {/* Right Side: Active Gaze Analytics metrics counters */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide">ATTENTION FOCUS</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-bold font-sans text-slate-100">{focusScore}%</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide">DISTRACTION EVENTS</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-bold font-sans text-slate-100">{distractionEvents}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide">BLINK FATIGUE CYCLES</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-bold font-sans text-slate-100">{blinkCount}</span>
              </div>
            </div>
          </div>

          {isFinished && (
            <button
              onClick={submitGazeScore}
              className="w-full py-3.5 rounded-xl bg-indigo-600 font-medium text-sm text-white hover:bg-indigo-500 transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Submit Session Data</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default EyeTrackingModule;
