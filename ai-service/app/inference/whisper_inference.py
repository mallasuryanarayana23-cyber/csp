import os
from transformers import pipeline

print("Loading HuggingFace Whisper PyTorch Model (openai/whisper-tiny)...")
whisper_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-tiny")
print("Whisper model loaded successfully.")

def transcribe_speech(audio_path: str):
    """
    Transcribes audio speech using HuggingFace Whisper and measures basic metrics.
    """
    result = whisper_pipeline(audio_path)
    return result["text"]
