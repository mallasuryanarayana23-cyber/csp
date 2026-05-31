# Backward-compatible wrapper pointing to modularized training package
from app.models.cognitive_lstm import CognitiveLSTM
from app.training.train_lstm import train_lstm_fusion_model
from app.training.train_dt import train_recommendation_model

if __name__ == "__main__":
    print("Initializing NeuroLearn Deep AI Model Training Pipeline (LSTM)...")
    train_lstm_fusion_model()
    train_recommendation_model()
    print("All models trained and saved successfully.")
