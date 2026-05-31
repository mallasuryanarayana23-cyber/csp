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
    
    # High Engagement sequences
    X_high = generate_sequence([15, 12, 100, 150, 0.08, 1], [5, 2, 20, 30, 0.02, 1])
    y_high = np.random.normal(loc=90, scale=5, size=samples_per_class)
    
    # Moderate Engagement sequences
    X_med = generate_sequence([35, 8, 150, 250, 0.05, 5], [10, 3, 30, 40, 0.01, 2])
    y_med = np.random.normal(loc=65, scale=10, size=samples_per_class)
    
    # Low Engagement sequences (High stress)
    X_low = generate_sequence([60, 5, 200, 400, 0.02, 15], [15, 2, 40, 60, 0.01, 5])
    y_low = np.random.normal(loc=35, scale=15, size=samples_per_class)
    
    X = np.vstack([X_high, X_med, X_low])
    X = np.maximum(X, 0)
    y = np.concatenate([y_high, y_med, y_low])
    y = np.clip(y, 0, 100)
    
    # Convert to PyTorch tensors
    X_tensor = torch.tensor(X, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.float32).view(-1, 1)
    
    model = CognitiveLSTM()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    print("Training Multi-Modal Fusion LSTM (PyTorch)...")
    epochs = 30
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        loss.backward()
        optimizer.step()
        
    torch.save(model.state_dict(), LSTM_MODEL_PATH)
    print(f"PyTorch LSTM model saved to {LSTM_MODEL_PATH}.")
