from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from schemas import Zone, Incident, MetricsSummary
from data_mock import ZONES, INCIDENTS, METRICS

app = FastAPI(title="PeakPulse API", description="Backend service for PeakPulse")

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; restrict to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def read_root():
    """Root endpoint to verify the API is running."""
    return {"message": "Welcome to the PeakPulse API"}


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/api/zones", response_model=List[Zone], tags=["Domain"])
def get_zones():
    """Retrieve all delivery zones and their current metrics."""
    return ZONES

@app.get("/api/incidents", response_model=List[Incident], tags=["Domain"])
def get_incidents():
    """Retrieve all recent SLA breach incidents."""
    return INCIDENTS

@app.get("/api/metrics", response_model=MetricsSummary, tags=["Domain"])
def get_metrics():
    """Retrieve high-level operations metrics summary."""
    return METRICS
