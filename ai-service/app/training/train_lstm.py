import os
import numpy as np
import torch
import torch.nn as nn
from app.models.cognitive_lstm import CognitiveLSTM

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)
LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "fusion_lstm.pth")

def train_lstm_fusion_model():
    print("Generating synthetic TEMPORAL sequence data for PyTorch LSTM...")
    seq_length = 10
    samples_per_class = 300
    
    def generate_sequence(loc, scale):
        return np.random.normal(loc=loc, scale=scale, size=(samples_per_class, seq_length, 6))
    
    # 1. Neurotypical (NT) Cohort Profile (Low gaze dispersion, healthy blink, rapid/consistent typing, minimal hesitation)
    X_nt = generate_sequence([12.0, 5.0, 95.0, 125.0, 0.08, 0.5], [3.0, 1.0, 15.0, 20.0, 0.02, 0.5])
    y_nt = np.random.normal(loc=92.0, scale=4.0, size=samples_per_class)
    
    # 2. Dyslexic (DYS) Cohort Profile (Elevated gaze re-reading, shorter blink interval/fatigue, high dwell/flight times, moderate hesitation)
    X_dys = generate_sequence([24.0, 3.0, 210.0, 320.0, 0.04, 5.5], [6.0, 0.8, 35.0, 50.0, 0.01, 1.5])
    y_dys = np.random.normal(loc=52.0, scale=8.0, size=samples_per_class)
    
    # 3. ADHD Cohort Profile (Extremely high gaze dispersion/distraction, erratic blink interval, impulsive dwell but highly variable flight, high hesitation)
    X_adhd = generate_sequence([58.0, 9.5, 75.0, 280.0, 0.06, 8.5], [12.0, 2.5, 10.0, 90.0, 0.02, 2.5])
    y_adhd = np.random.normal(loc=42.0, scale=10.0, size=samples_per_class)
    
    X = np.vstack([X_nt, X_dys, X_adhd])
    X = np.maximum(X, 0)
    y = np.concatenate([y_nt, y_dys, y_adhd])
    y = np.clip(y, 0, 100)
    
    # Convert to PyTorch tensors
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.float32).view(-1, 1)
    
    model = CognitiveLSTM()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    print("Training Multi-Modal Fusion LSTM (PyTorch) on Neuro-Diverse cohorts...")
    epochs = 40
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        loss.backward()
        optimizer.step()
        
    torch.save(model.state_dict(), LSTM_MODEL_PATH)
    print(f"PyTorch LSTM model saved to {LSTM_MODEL_PATH}.")
