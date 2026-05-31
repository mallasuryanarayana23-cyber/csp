import os
import joblib
import numpy as np

MODEL_DIR = "models"
REC_MODEL_PATH = os.path.join(MODEL_DIR, "recommendation_model.joblib")

recommendation_model = None

def get_recommendation_model():
    global recommendation_model
    if recommendation_model is None:
        if os.path.exists(REC_MODEL_PATH):
            recommendation_model = joblib.load(REC_MODEL_PATH)
            print("Loaded DecisionTree recommendation model.")
        else:
            print("Recommendation model joblib not found.")
    return recommendation_model

def run_recommendation(payload):
    model = get_recommendation_model()
    if model is None:
        raise ValueError("Recommendation model is not initialized.")
        
    features = np.array([[payload.focus_score, payload.fluency_score, payload.distraction_events]])
    cluster_id = int(model.predict(features)[0])
    
    interventions = {
        0: ["Visual-Spatial Grounding Exercises", "Enable High-Contrast UI", "Increase Font Scaling"],
        1: ["Phonetic Repetition Drills", "Enable Text-to-Speech Guide", "Reduce Paragraph Length"],
        2: ["Advanced Cognitive Challenge", "Reduce UI Assistive Vectors"],
        3: ["Mandatory 5-minute Cognitive Rest Period", "Breathing Exercises"]
    }
    
    labels = {
        0: "Visual-Spatial Deficit Detected",
        1: "Phonetic Fluency Gap Detected",
        2: "Optimal Engagement",
        3: "Severe Cognitive Fatigue"
    }
    
    return {
        "cluster_id": cluster_id,
        "diagnosis": labels[cluster_id],
        "recommended_interventions": interventions[cluster_id]
    }
