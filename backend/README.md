# PeakPulse Backend

This folder contains the FastAPI backend for PeakPulse.

## What it provides

- `GET /` — basic welcome response
- `GET /api/health` — health check
- `GET /api/zones` — mock zone data
- `GET /api/incidents` — mock incident data
- `GET /api/metrics` — mock summary metrics

## Run locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API from this folder:

```bash
uvicorn main:app --reload --port 8000
```

## Smoke test

Run the included backend smoke test:

```bash
python -m pytest test_backend.py
```
