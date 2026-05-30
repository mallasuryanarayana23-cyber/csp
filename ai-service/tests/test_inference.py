from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ONLINE"

def test_fusion_inference():
    payload = {
        "gaze_dispersion": 45.2,
        "blink_interval": 3.1,
        "avg_dwell": 250.5,
        "avg_flight": 120.3,
        "rms_amplitude": 0.45,
        "hesitation_events": 5
    }
    response = client.post("/ai/predict/fusion", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "cognitive_engagement_score" in data
    assert "risk_tier" in data
    assert "explainability" in data
