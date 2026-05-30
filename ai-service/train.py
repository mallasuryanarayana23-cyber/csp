import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import joblib

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_dyslexia_model():
    print("Generating synthetic keystroke data for Dyslexia model...")
    # Features: [avg_dwell_time, avg_flight_time, letter_substitutions]
    # Label: 0 (Low Risk), 1 (Medium Risk), 2 (High Risk)
    
    # Generate healthy data (Low risk)
    X_healthy = np.random.normal(loc=[100, 150, 0.5], scale=[20, 30, 0.5], size=(1000, 3))
    y_healthy = np.zeros(1000)
    
    # Generate moderate data (Medium risk)
    X_med = np.random.normal(loc=[150, 250, 2], scale=[30, 40, 1], size=(1000, 3))
    y_med = np.ones(1000)
    
    # Generate severe data (High risk)
    X_high = np.random.normal(loc=[200, 400, 5], scale=[40, 60, 2], size=(1000, 3))
    y_high = np.full(1000, 2)
    
    X = np.vstack([X_healthy, X_med, X_high])
    # Clip negative values
    X = np.maximum(X, 0)
    y = np.concatenate([y_healthy, y_med, y_high])
    
    print("Training Keystroke RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    clf.fit(X, y)
    
    joblib.dump(clf, os.path.join(MODEL_DIR, "dyslexia_model.joblib"))
    print("Dyslexia model saved.")

def train_adhd_model():
    print("Generating synthetic gaze data for ADHD model...")
    # Features: [gaze_dispersion, avg_blink_interval]
    # Label: 0 (Low), 1 (Medium), 2 (High)
    
    # Low risk (Low dispersion, normal blinks 10-15s)
    X_low = np.random.normal(loc=[15, 12], scale=[5, 2], size=(1000, 2))
    y_low = np.zeros(1000)
    
    # Medium risk
    X_med = np.random.normal(loc=[35, 8], scale=[10, 3], size=(1000, 2))
    y_med = np.ones(1000)
    
    # High risk (High dispersion, very low or very high blinks, let's say very low ~5s)
    X_high = np.random.normal(loc=[60, 5], scale=[15, 2], size=(1000, 2))
    y_high = np.full(1000, 2)
    
    X = np.vstack([X_low, X_med, X_high])
    X = np.maximum(X, 0)
    y = np.concatenate([y_low, y_med, y_high])
    
    print("Training Gaze RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    clf.fit(X, y)
    
    joblib.dump(clf, os.path.join(MODEL_DIR, "adhd_model.joblib"))
    print("ADHD model saved.")

def train_speech_model():
    print("Generating synthetic audio data for Speech Fluency model...")
    # Features: [avg_rms_amplitude, hesitation_events]
    # Label: Fluency Score (0-100)
    
    # High fluency
    X_high = np.random.normal(loc=[0.08, 1], scale=[0.02, 1], size=(500, 2))
    y_high = np.random.normal(loc=95, scale=5, size=500)
    
    # Medium fluency
    X_med = np.random.normal(loc=[0.05, 5], scale=[0.01, 2], size=(500, 2))
    y_med = np.random.normal(loc=70, scale=10, size=500)
    
    # Low fluency
    X_low = np.random.normal(loc=[0.02, 15], scale=[0.01, 5], size=(500, 2))
    y_low = np.random.normal(loc=40, scale=15, size=500)
    
    X = np.vstack([X_high, X_med, X_low])
    X = np.maximum(X, 0)
    y = np.concatenate([y_high, y_med, y_low])
    y = np.clip(y, 0, 100)
    
    print("Training Speech RandomForestRegressor...")
    reg = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
    reg.fit(X, y)
    
    joblib.dump(reg, os.path.join(MODEL_DIR, "speech_model.joblib"))
    print("Speech model saved.")

if __name__ == "__main__":
    print("Initializing NeuroLearn AI Model Training Pipeline...")
    train_dyslexia_model()
    train_adhd_model()
    train_speech_model()
    print("All models trained and saved to 'models/' directory.")
