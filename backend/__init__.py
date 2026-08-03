"""PeakPulse backend package.

Importing `backend` exposes the FastAPI app for convenience:

	from backend import app

This also ensures the package is recognized by Python when using
package-relative imports inside the backend modules.
"""

from .main import app

__all__ = ["app"]
