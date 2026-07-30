from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
