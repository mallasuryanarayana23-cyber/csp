import os
import numpy as np
import torch
import torch.nn as nn
from sklearn.tree import DecisionTreeClassifier
import joblib

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ---------------------------------------------------------
# Phase 4: True LSTM Temporal Sequence Modeling (PyTorch)
# ---------------------------------------------------------
class CognitiveLSTM(nn.Module):
    def __init__(self, input_size=6, hidden_size=16, num_layers=2, output_size=1):
        super(CognitiveLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        # x shape: (batch_size, sequence_length, input_size)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        # Take the output from the last time step
        out = self.fc(out[:, -1, :])
        return out

def train_lstm_fusion_model():
    print("Generating synthetic TEMPORAL sequence data for PyTorch LSTM...")
    # Features: [gaze_dispersion, blink_interval, avg_dwell, avg_flight, rms_amplitude, hesitation_events]
    seq_length = 10
    samples_per_class = 300
    
    def generate_sequence(loc, scale):
        # (samples, seq_length, features)
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
        
    torch.save(model.state_dict(), os.path.join(MODEL_DIR, "fusion_lstm.pth"))
    print("PyTorch LSTM model saved.")

# ---------------------------------------------------------
# Phase 7 & 9: ML Clustering Recommendation Model
# ---------------------------------------------------------
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
    
    joblib.dump(clf, os.path.join(MODEL_DIR, "recommendation_model.joblib"))
    print("Recommendation model saved.")

if __name__ == "__main__":
    print("Initializing NeuroLearn Deep AI Model Training Pipeline (LSTM)...")
    train_lstm_fusion_model()
    train_recommendation_model()
    print("All models trained and saved to 'models/' directory.")
