from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the PeakPulse API"


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_zones_endpoint():
    response = client.get("/api/zones")
    assert response.status_code == 200
    zones = response.json()
    assert isinstance(zones, list)
    assert len(zones) == 6
    assert zones[0]["name"] == "Zone A"


def test_incidents_endpoint():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    incidents = response.json()
    assert isinstance(incidents, list)
    assert len(incidents) == 5
    assert incidents[0]["id"] == "INC-4821"


def test_metrics_endpoint():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert metrics["totalOrders"] == 4821
    assert metrics["activeRiders"] == 177
