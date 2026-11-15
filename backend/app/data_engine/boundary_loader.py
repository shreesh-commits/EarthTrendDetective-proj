"""Karnataka Boundary Integration & Spatial Filtering Engine.
Downloads, caches, and verifies official Karnataka state and district boundaries.
Provides point-in-polygon verification and spatial clipping for environmental grid points.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import requests
from shapely.geometry import Point, shape, mapping
from shapely.ops import unary_union

from app.config import BOUNDARIES_DIR, KARNATAKA_BBOX

logger = logging.getLogger(__name__)

DISTRICT_GEOJSON_URL = (
    "https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/state_ut/karnataka/district/karnataka_district.json"
)

STATE_GEOJSON_FILE = BOUNDARIES_DIR / "karnataka_state.geojson"
DISTRICTS_GEOJSON_FILE = BOUNDARIES_DIR / "karnataka_districts.geojson"


class KarnatakaBoundaryManager:
    """Manages official Karnataka geospatial boundaries and point-in-polygon queries."""

    def __init__(self):
        self.state_polygon = None
        self.district_features = []
        self.district_shapes = {}
        self._ensure_boundaries_loaded()

    def _ensure_boundaries_loaded(self):
        """Load boundaries from local files or download from official repository."""
        BOUNDARIES_DIR.mkdir(parents=True, exist_ok=True)

        if not DISTRICTS_GEOJSON_FILE.exists() or not STATE_GEOJSON_FILE.exists():
            self._download_and_process_boundaries()
        else:
            self._load_from_disk()

    def _download_and_process_boundaries(self):
        """Download district GeoJSON and generate unified state boundary."""
        logger.info("Downloading official Karnataka district boundaries...")
        headers = {"User-Agent": "EarthTrendDetective/1.0 (NASA Hackathon)"}
        response = requests.get(DISTRICT_GEOJSON_URL, headers=headers, timeout=20)
        response.raise_for_status()
        data = response.json()

        # Save districts GeoJSON
        with open(DISTRICTS_GEOJSON_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        # Union into state polygon
        polygons = []
        for feat in data.get("features", []):
            poly = shape(feat["geometry"])
            polygons.append(poly)
            dist_name = feat.get("properties", {}).get("district", "Unknown")
            self.district_shapes[dist_name] = poly

        unified_state = unary_union(polygons)
        self.state_polygon = unified_state

        state_geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "state_name": "Karnataka",
                        "country": "India",
                        "district_count": len(data.get("features", [])),
                        "bounds": unified_state.bounds,
                    },
                    "geometry": mapping(unified_state),
                }
            ],
        }

        with open(STATE_GEOJSON_FILE, "w", encoding="utf-8") as f:
            json.dump(state_geojson, f, indent=2)

        self.district_features = data.get("features", [])
        logger.info("Saved %d district boundaries and unified state polygon.", len(self.district_features))

    def _load_from_disk(self):
        """Load GeoJSON from disk."""
        with open(STATE_GEOJSON_FILE, "r", encoding="utf-8") as f:
            state_data = json.load(f)
            geom_dict = state_data["features"][0]["geometry"]
            self.state_polygon = shape(geom_dict)

        with open(DISTRICTS_GEOJSON_FILE, "r", encoding="utf-8") as f:
            dist_data = json.load(f)
            self.district_features = dist_data.get("features", [])
            for feat in self.district_features:
                dist_name = feat.get("properties", {}).get("district", "Unknown")
                self.district_shapes[dist_name] = shape(feat["geometry"])

    def is_inside_karnataka(self, lat: float, lon: float) -> bool:
        """Check if coordinates fall strictly inside Karnataka state boundary (not just bbox)."""
        # First check fast bounding box
        if not (KARNATAKA_BBOX["min_lat"] <= lat <= KARNATAKA_BBOX["max_lat"] and
                KARNATAKA_BBOX["min_lon"] <= lon <= KARNATAKA_BBOX["max_lon"]):
            return False

        # Exact point-in-polygon test
        pt = Point(lon, lat)  # Note: Shapely uses (x, y) = (lon, lat)
        return self.state_polygon.contains(pt) or self.state_polygon.touches(pt)

    def identify_district(self, lat: float, lon: float) -> Optional[str]:
        """Identify which district a coordinate point belongs to, or None if outside."""
        pt = Point(lon, lat)
        for dist_name, poly in self.district_shapes.items():
            if poly.contains(pt) or poly.touches(pt):
                return dist_name
        return None

    def get_state_geojson(self) -> Dict:
        """Return GeoJSON of the Karnataka state boundary."""
        with open(STATE_GEOJSON_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_districts_geojson(self) -> Dict:
        """Return GeoJSON of all Karnataka districts."""
        with open(DISTRICTS_GEOJSON_FILE, "r", encoding="utf-8") as f:
            return json.load(f)


# Singleton boundary manager instance
boundary_manager = KarnatakaBoundaryManager()
