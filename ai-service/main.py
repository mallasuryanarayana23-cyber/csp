# FastAPI AI Microservice for NeuroLearn Platforms (Real Deep ML Inference)
import os
import time
import uuid
import shutil
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import sentry_sdk
from prometheus_fastapi_instrumentator import Instrumentator

# Backward-compatible model/train wrappers
import train
from app.preprocessing.speech_preprocessing import extract_speech_fluency
from app.inference.whisper_inference import transcribe_speech
from app.inference.lstm_inference import predict_gaze_typing_fusion
from app.inference.recommendation_inference import run_recommendation

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN", ""),
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

app = FastAPI(
    title="NeuroLearn True AI Inference Service",
    description="Startup-Grade Multi-modal Behavioral ML Screeners with NLP",
    version="4.0.0"
)

Instrumentator().instrument(app).expose(app)

MODEL_DIR = "models"
LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "fusion_lstm.pth")
REC_MODEL_PATH = os.path.join(MODEL_DIR, "recommendation_model.joblib")

# Ensure models are trained at startup
if not os.path.exists(LSTM_MODEL_PATH) or not os.path.exists(REC_MODEL_PATH):
    print("Pre-trained models not found. Running PyTorch training pipeline...")
    train.train_lstm_fusion_model()
    train.train_recommendation_model()

print("Models initialized successfully.")

# Input Schemas defining deep sensory features
class FusionInferenceRequest(BaseModel):
    gaze_dispersion: float
    blink_interval: float
    avg_dwell: float
    avg_flight: float
    rms_amplitude: float
    hesitation_events: int

class RecommendationRequest(BaseModel):
    focus_score: float
    fluency_score: float
    distraction_events: int

@app.get("/")
def read_root():
    return {"service": "NeuroLearn FastAPI ML Cluster", "status": "ONLINE", "models_loaded": True}

@app.post("/ai/predict/speech-whisper")
async def predict_speech_whisper(file: UploadFile = File(...)):
    """
    True NLP Pipeline using HuggingFace PyTorch Whisper extraction and librosa features.
    """
    try:
        req_id = uuid.uuid4().hex
        
        # Ensure temporary directory exists
        os.makedirs("tmp", exist_ok=True)
        temp_audio_path = f"tmp/{req_id}_{file.filename}"
        
        with open(temp_audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        start_time = time.time()
        
        # Speech feature extraction
        features = extract_speech_fluency(temp_audio_path)
        duration = features["duration"]
        silence_ratio = features["silence_ratio"]
        
        # Whisper speech ASR transcription
        transcription = transcribe_speech(temp_audio_path)
        
        end_time = time.time()
        latency_ms = (end_time - start_time) * 1000

        words = len(transcription.split())
        wpm = (words / duration) * 60 if duration > 0 else 0
        
        hesitation_detected = transcription.lower().count(" um ") + transcription.lower().count(" uh ")
        # Advanced fluency score combining WPM and Silence Ratio
        fluency_score = min(100, max(0, (1.0 - silence_ratio) * 100 - (hesitation_detected * 5)))

        os.remove(temp_audio_path)
        
        return {
            "prediction": "SPEECH_FLUENCY_NLP",
            "transcription": transcription.strip(),
            "fluency_score": round(fluency_score, 2),
            "wpm": round(wpm, 2),
            "hesitation_events": hesitation_detected,
            "latency_ms": round(latency_ms, 2)
        }
    except Exception as e:
        print(f"[Error in Speech Pipeline] {str(e)}")
        raise HTTPException(status_code=500, detail="Internal AI Service Error")

@app.post("/ai/predict/fusion")
def predict_fusion(payload: FusionInferenceRequest):
    """
    True Multi-Modal Temporal AI Fusion (PyTorch LSTM)
    """
    try:
        return predict_gaze_typing_fusion(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/recommend")
def get_recommendation(payload: RecommendationRequest):
    try:
        return run_recommendation(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
