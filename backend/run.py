"""Launch script for EarthTrend Detective Backend."""
import sys
from pathlib import Path
import uvicorn

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False, app_dir=str(backend_dir))

