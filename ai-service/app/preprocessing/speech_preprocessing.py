import librosa
import numpy as np

def extract_speech_fluency(audio_path: str):
    """
    Extracts acoustic features from an audio file to determine fluency metrics.
    """
    # Load audio file with librosa (resample to 16000Hz for Whisper)
    y, sr = librosa.load(audio_path, sr=16000)
    duration = librosa.get_duration(y=y, sr=sr)
    
    # Identify non-silent portions of the speech
    non_silent_intervals = librosa.effects.split(y, top_db=20)
    non_silent_duration = sum([(end - start) / sr for start, end in non_silent_intervals])
    
    silence_ratio = 1.0 - (non_silent_duration / duration) if duration > 0 else 0
    return {
        "duration": duration,
        "silence_ratio": silence_ratio,
        "rms_amplitude": float(np.sqrt(np.mean(y**2)))
    }
