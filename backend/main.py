from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_mock import INCIDENTS, METRICS, ZONES
from schemas import Incident, MetricsSummary, Zone


app = FastAPI(
    title="PeakPulse API",
    description="Backend service for PeakPulse",
    version="1.0.0",
)

# Configure CORS to allow frontend connections.
# Keep this permissive for local development and narrow it in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root endpoint to verify the API is running."""
    return {"message": "Welcome to the PeakPulse API", "version": "1.0.0"}


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/zones", response_model=List[Zone], tags=["Domain"])
def get_zones():
    """Return all delivery zones and their metrics."""
    return ZONES


@app.get("/api/incidents", response_model=List[Incident], tags=["Domain"])
def get_incidents():
    """Return the most recent SLA breach incidents."""
    return INCIDENTS


@app.get("/api/metrics", response_model=MetricsSummary, tags=["Domain"])
def get_metrics():
    """Return the headline operations summary."""
    return METRICS
