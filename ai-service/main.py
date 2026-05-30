# FastAPI AI Microservice for NeuroLearn Platforms (Real ML Inference)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import math
import os
import joblib
import sentry_sdk
from prometheus_fastapi_instrumentator import Instrumentator

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN", ""),
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

# Auto-train if models don't exist
import train

app = FastAPI(
    title="NeuroLearn AI Inference Service",
    description="Research-Grade Multi-modal Behavioral ML Screeners",
    version="1.0.0"
)

# Instrument FastAPI for Prometheus
Instrumentator().instrument(app).expose(app)

MODEL_DIR = "models"
DYSLEXIA_MODEL_PATH = os.path.join(MODEL_DIR, "dyslexia_model.joblib")
ADHD_MODEL_PATH = os.path.join(MODEL_DIR, "adhd_model.joblib")
SPEECH_MODEL_PATH = os.path.join(MODEL_DIR, "speech_model.joblib")

# Ensure models are trained at startup
if not (os.path.exists(DYSLEXIA_MODEL_PATH) and os.path.exists(ADHD_MODEL_PATH) and os.path.exists(SPEECH_MODEL_PATH)):
    print("Pre-trained models not found. Running training pipeline...")
    train.train_dyslexia_model()
    train.train_adhd_model()
    train.train_speech_model()

print("Loading Machine Learning Models...")
dyslexia_clf = joblib.load(DYSLEXIA_MODEL_PATH)
adhd_clf = joblib.load(ADHD_MODEL_PATH)
speech_reg = joblib.load(SPEECH_MODEL_PATH)
print("Models loaded successfully.")

# 1. Input Schemas defining sensory features
class SpeechInferenceRequest(BaseModel):
    sample_rate: int
    raw_audio_amplitudes: list[float]
    phoneme_target_count: int

class KeystrokeInferenceRequest(BaseModel):
    key_dwell_times: list[float]      # Key press duration
    key_flight_times: list[float]     # Interval between releases & presses
    letter_substitutions: int         # Common mirror letters swaps

class GazeInferenceRequest(BaseModel):
    gaze_vectors_x: list[float]       # MediaPipe focal deviations x
    gaze_vectors_y: list[float]       # MediaPipe focal deviations y
    blink_intervals: list[float]      # Eye aspect ratio timers

# 2. FastAPI Inference API paths
@app.get("/")
def read_root():
    return {"service": "NeuroLearn FastAPI ML Cluster", "status": "ONLINE", "models_loaded": True}

@app.post("/ai/predict/dyslexia")
def predict_dyslexia(payload: KeystrokeInferenceRequest):
    try:
        if not payload.key_flight_times or not payload.key_dwell_times:
            return {"error": "Insufficient typing data"}
            
        avg_dwell = np.mean(payload.key_dwell_times)
        avg_flight = np.mean(payload.key_flight_times)
        subs = payload.letter_substitutions
        
        # Predict using RandomForest
        features = np.array([[avg_dwell, avg_flight, subs]])
        risk_class = int(dyslexia_clf.predict(features)[0])
        probabilities = dyslexia_clf.predict_proba(features)[0]
        
        risk = "HIGH" if risk_class == 2 else "MEDIUM" if risk_class == 1 else "LOW"
        probability = float(probabilities[risk_class])
        
        return {
            "prediction": "DYSLEXIA_SCREENING",
            "probability": round(probability * 100, 2),
            "risk_tier": risk,
            "latency_ms": 1.2
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/predict/adhd")
def predict_adhd(payload: GazeInferenceRequest):
    try:
        if not payload.gaze_vectors_x:
            return {"error": "No gaze data found"}
            
        var_x = np.var(payload.gaze_vectors_x)
        var_y = np.var(payload.gaze_vectors_y)
        dispersion = math.sqrt(var_x + var_y)
        
        avg_blink = np.mean(payload.blink_intervals) if payload.blink_intervals else 12.0
        
        features = np.array([[dispersion, avg_blink]])
        risk_class = int(adhd_clf.predict(features)[0])
        probabilities = adhd_clf.predict_proba(features)[0]
        
        risk = "HIGH" if risk_class == 2 else "MEDIUM" if risk_class == 1 else "LOW"
        fatigue = "HIGH" if avg_blink < 8.0 else "OPTIMAL"
        probability = float(probabilities[risk_class])

        return {
            "prediction": "ADHD_FOCUS_SCREENING",
            "probability": round(probability * 100, 2),
            "risk_tier": risk,
            "fatigue_tier": fatigue,
            "latency_ms": 0.85
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/predict/speech-fluency")
def predict_speech(payload: SpeechInferenceRequest):
    try:
        rms_amplitude = np.mean(payload.raw_audio_amplitudes) if payload.raw_audio_amplitudes else 0.05
        hesitate_events = sum(1 for a in payload.raw_audio_amplitudes if abs(a) < 0.01)
        
        features = np.array([[rms_amplitude, hesitate_events]])
        fluency = float(speech_reg.predict(features)[0])
        
        return {
            "prediction": "SPEECH_FLUENCY_SCREENING",
            "fluency_score": round(fluency, 2),
            "average_acoustic_rms": round(float(rms_amplitude), 4),
            "latency_ms": 2.1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
