"""Comprehensive Test Suite for EarthTrend Detective Backend."""

import unittest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from app.main import app
from app.core.statistics import mann_kendall_test, sens_slope, linear_regression_trend, detect_climatological_anomalies
from app.data_engine.boundary_loader import boundary_manager
from app.core.geospatial import filter_points_within_karnataka, get_agro_climatic_zone
from app.core.cross_parameter import cross_parameter_engine


class TestEarthTrendDetective(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    # 1. Statistical Engine Tests
    def test_mann_kendall_increasing(self):
        # Monotonically increasing synthetic series: 1, 2, 3, ..., 20
        series = np.arange(1.0, 21.0)
        res = mann_kendall_test(series)
        self.assertEqual(res["trend"], "increasing")
        self.assertTrue(res["is_significant"])
        self.assertLess(res["p_value"], 0.001)

    def test_mann_kendall_decreasing(self):
        # Monotonically decreasing series
        series = np.arange(20.0, 0.0, -1.0)
        res = mann_kendall_test(series)
        self.assertEqual(res["trend"], "decreasing")
        self.assertTrue(res["is_significant"])

    def test_sens_slope(self):
        # Exact linear series y = 2.5 * t + 10
        t = np.arange(2000, 2025)
        y = 2.5 * t + 10.0
        res = sens_slope(y, t)
        self.assertAlmostEqual(res["sen_slope"], 2.5, places=3)
        self.assertAlmostEqual(res["unit_per_decade"], 25.0, places=2)

    def test_linear_regression(self):
        t = np.arange(2000, 2025)
        y = 0.5 * t + 5.0
        res = linear_regression_trend(y, t)
        self.assertAlmostEqual(res["slope"], 0.5, places=3)
        self.assertAlmostEqual(res["r_squared"], 1.0, places=3)

    def test_anomaly_detection(self):
        # 12 months with normal 25.0, one extreme outlier month with 45.0
        data = []
        for year in range(2000, 2010):
            for month in range(1, 13):
                val = 45.0 if year == 2005 and month == 5 else 25.0 + np.random.normal(0, 0.5)
                data.append({"year": year, "month": month, "val": val})
        df = pd.DataFrame(data)
        anom = detect_climatological_anomalies(df, "val", z_threshold=2.0)
        outliers = anom[anom["is_anomaly"]]
        self.assertGreaterEqual(len(outliers), 1)
        self.assertTrue((outliers["year"] == 2005).any())

    # 2. Geospatial Boundary Tests
    def test_karnataka_boundary_filtering(self):
        # Bengaluru is strictly inside
        self.assertTrue(boundary_manager.is_inside_karnataka(12.9716, 77.5946))
        # Kalaburagi is strictly inside
        self.assertTrue(boundary_manager.is_inside_karnataka(17.3297, 76.8343))
        # Mumbai is outside
        self.assertFalse(boundary_manager.is_inside_karnataka(19.0760, 72.8777))
        # Central Arabian Sea is outside
        self.assertFalse(boundary_manager.is_inside_karnataka(14.0000, 72.0000))

    def test_agro_climatic_classification(self):
        # Karwar coastal point
        self.assertEqual(get_agro_climatic_zone(14.8, 74.2), "Coastal Zone")
        # Kalaburagi point
        self.assertEqual(get_agro_climatic_zone(17.3, 76.8), "North Eastern Dry Zone")

    # 3. Cross Parameter Engine Tests
    def test_cross_parameter_matrix(self):
        mat = cross_parameter_engine.compute_correlation_matrix()
        self.assertIn("variables", mat)
        self.assertIn("pearson", mat)
        self.assertIn("spearman", mat)
        self.assertGreater(len(mat["variables"]), 0)

    # 4. FastAPI Endpoints Tests
    def test_api_root(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")

    def test_api_overview_stats(self):
        response = self.client.get("/api/overview/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_parameters_monitored"], 6)

    def test_api_parameters_list(self):
        response = self.client.get("/api/parameters/list")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 6)

    def test_api_parameter_summary(self):
        response = self.client.get("/api/parameters/air_temperature/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("mann_kendall", data)
        self.assertIn("sens_slope", data)

    def test_api_all_trends(self):
        response = self.client.get("/api/statistics/all-trends")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["trends"]), 6)

    def test_api_anomalies(self):
        response = self.client.get("/api/statistics/anomalies")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("anomalies", data)

    def test_api_map_points(self):
        response = self.client.get("/api/map/monitoring-points?parameter=air_temperature")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["total_monitoring_points"], 0)

    def test_api_sources_registry(self):
        response = self.client.get("/api/sources/registry")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data["sources"]), 0)


if __name__ == "__main__":
    unittest.main()
