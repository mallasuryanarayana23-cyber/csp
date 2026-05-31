import os
import numpy as np
from sklearn.tree import DecisionTreeClassifier
import joblib

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)
REC_MODEL_PATH = os.path.join(MODEL_DIR, "recommendation_model.joblib")

def train_recommendation_model():
    print("Generating cognitive clusters for Recommendation model...")
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
    
    joblib.dump(clf, REC_MODEL_PATH)
    print(f"Recommendation model saved to {REC_MODEL_PATH}.")
