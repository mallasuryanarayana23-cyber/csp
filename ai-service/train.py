import os
import numpy as np
import xgboost as xgb
from sklearn.tree import DecisionTreeClassifier
import joblib
import pandas as pd

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_fusion_model():
    print("Generating synthetic multi-modal data for Fusion model...")
    # Features: [gaze_dispersion, blink_interval, avg_dwell, avg_flight, rms_amplitude, hesitation_events]
    # Label: Cognitive Engagement Score (0-100)
    
    # High Engagement
    X_high = np.random.normal(loc=[15, 12, 100, 150, 0.08, 1], scale=[5, 2, 20, 30, 0.02, 1], size=(500, 6))
    y_high = np.random.normal(loc=90, scale=5, size=500)
    
    # Moderate Engagement
    X_med = np.random.normal(loc=[35, 8, 150, 250, 0.05, 5], scale=[10, 3, 30, 40, 0.01, 2], size=(500, 6))
    y_med = np.random.normal(loc=65, scale=10, size=500)
    
    # Low Engagement (High stress/distraction)
    X_low = np.random.normal(loc=[60, 5, 200, 400, 0.02, 15], scale=[15, 2, 40, 60, 0.01, 5], size=(500, 6))
    y_low = np.random.normal(loc=35, scale=15, size=500)
    
    X = np.vstack([X_high, X_med, X_low])
    X = np.maximum(X, 0)
    y = np.concatenate([y_high, y_med, y_low])
    y = np.clip(y, 0, 100)
    
    print("Training Multi-Modal Fusion XGBoost Regressor...")
    model = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, os.path.join(MODEL_DIR, "fusion_model.joblib"))
    print("Fusion model saved.")

def train_recommendation_model():
    print("Generating synthetic cognitive clusters for Recommendation model...")
    # Features: [focus_score, fluency_score, distraction_events]
    # Label classes (Intervention Categories):
    # 0 -> "Visual-Spatial Interventions" (Low Focus, High Distractions)
    # 1 -> "Phonetic Drills" (Low Fluency, Stable Focus)
    # 2 -> "Advanced Challenge" (High Focus, High Fluency)
    # 3 -> "Cognitive Rest Period" (Extremely low scores across the board)
    
    X_vis = np.random.normal(loc=[40, 85, 15], scale=[10, 5, 3], size=(500, 3))
    y_vis = np.zeros(500)
    
    X_phon = np.random.normal(loc=[85, 40, 2], scale=[5, 10, 1], size=(500, 3))
    y_phon = np.ones(500)
    
    X_adv = np.random.normal(loc=[95, 95, 1], scale=[3, 3, 1], size=(500, 3))
    y_adv = np.full(500, 2)
    
    X_rest = np.random.normal(loc=[30, 35, 10], scale=[8, 8, 4], size=(500, 3))
    y_rest = np.full(500, 3)
    
    X = np.vstack([X_vis, X_phon, X_adv, X_rest])
    X = np.maximum(X, 0)
    y = np.concatenate([y_vis, y_phon, y_adv, y_rest])
    
    print("Training DecisionTree Recommendation Classifier...")
    clf = DecisionTreeClassifier(max_depth=6, random_state=42)
    clf.fit(X, y)
    
    joblib.dump(clf, os.path.join(MODEL_DIR, "recommendation_model.joblib"))
    print("Recommendation model saved.")

if __name__ == "__main__":
    print("Initializing NeuroLearn Deep AI Model Training Pipeline...")
    train_fusion_model()
    train_recommendation_model()
    print("All models trained and saved to 'models/' directory.")
