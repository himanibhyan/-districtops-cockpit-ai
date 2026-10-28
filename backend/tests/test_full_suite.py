"""Comprehensive unit and integration test runner for all backend components."""
import unittest
from app.services.data_loader import DataStore
from app.utils.pdf_extractor import extract_fhtc_table
from app.db.database import (
    init_db,
    db_list_interventions,
    db_create_intervention,
    db_update_intervention,
    db_get_count
)
from app.models.schemas import (
    InterventionItem,
    InterventionPriority,
    InterventionStatus
)
from app.api.routes.contract_api import (
    get_health,
    get_dashboard,
    get_alert_detail,
    explain_alert
)
from datetime import datetime


class TestComprehensiveBackend(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.ds = DataStore()
        cls.ds.load_all()

    def test_01_water_pdf_extraction(self):
        """Test water PDF stream extractor and numerical accuracy."""
        recs, tot = extract_fhtc_table(r"C:\Users\Kanishk Singh\.gemini\antigravity\scratch\-districtops-cockpit-ai\backend\data\fhtc_water_coverage.pdf")
        self.assertEqual(len(recs), 34, "Expected exactly 34 States/UTs extracted from PDF")
        
        # Verify Haryana verified figures
        haryana = next(r for r in recs if r["state"] == "Haryana")
        self.assertEqual(haryana["total_households"], 3041314, "Haryana total households must match 30,41,314")
        self.assertEqual(haryana["households_with_tap"], 3041314, "Haryana households with tap must match 30,41,314")
        self.assertEqual(haryana["coverage_pct_reported"], 100.0)
        self.assertEqual(haryana["coverage_pct_calculated"], 100.0)
        self.assertEqual(haryana["coverage_discrepancy"], 0.0)
        self.assertEqual(haryana["_administrative_level"], "STATE")
        self.assertEqual(haryana["_source_classification"], "OFFICIAL")

    def test_02_sanitation_loading(self):
        """Test sanitation dataset loading and schema validation."""
        self.assertIsNotNone(self.ds.sanitation)
        self.assertGreater(len(self.ds.sanitation), 700)
        haryana = self.ds.get_haryana_sanitation()
        self.assertEqual(len(haryana), 22, "Haryana should have 22 district records in sanitation")

    def test_03_hmis_loading(self):
        """Test HMIS Haryana health indicators loading."""
        self.assertIsNotNone(self.ds.hmis)
        self.assertGreater(len(self.ds.hmis), 200000)
        districts = self.ds.get_hmis_districts()
        self.assertEqual(len(districts), 22, "HMIS should cover 22 Haryana districts")
        years = self.ds.get_hmis_fiscal_years()
        self.assertIn("2021-22", years)

    def test_04_kml_parsing(self):
        """Test Gurugram ward boundaries parsing."""
        self.assertIsNotNone(self.ds.kml_wards)
        self.assertEqual(len(self.ds.kml_wards), 35, "Gurugram KML should have 35 wards")
        first_ward = self.ds.kml_wards[0]
        self.assertIn("coordinates", first_ward["geometry"])

    def test_05_contract_api_endpoints(self):
        """Verify API contract compliance."""
        health = get_health()
        self.assertEqual(health.status, "healthy")
        self.assertTrue(health.is_synthetic)

        dash = get_dashboard()
        self.assertEqual(dash.district_name, "Central District")
        self.assertEqual(dash.dataset_tag, "[SYNTHETIC-DEMO]")
        self.assertGreater(len(dash.department_summaries), 0)

        # Benchmark Water Alert
        alert = get_alert_detail("alt-water-001")
        self.assertEqual(alert.risk_score, 78.9)
        self.assertEqual(alert.risk_level.value, "HIGH")

        # Decision support explanation
        exp = explain_alert("alt-water-001")
        self.assertEqual(exp.engine_mode, "DETERMINISTIC_FALLBACK")
        self.assertGreaterEqual(len(exp.root_causes), 2)
        self.assertGreaterEqual(len(exp.recommended_interventions), 1)

    def test_06_sqlite_persistence(self):
        """Verify intervention lifecycle in SQLite."""
        initial_count = db_get_count()
        new_id = f"test-int-{int(datetime.utcnow().timestamp())}"
        now = datetime.utcnow()
        
        # 1. Create
        item = InterventionItem(
            is_synthetic=True,
            id=new_id,
            alert_id="alt-water-001",
            title="Automated Test Intervention",
            action_type="TEST_ACTION",
            priority=InterventionPriority.HIGH,
            status=InterventionStatus.PROPOSED,
            assigned_to="QA Bot",
            created_at=now,
            updated_at=now,
            notes="Testing SQLite persistence"
        )
        created = db_create_intervention(item)
        self.assertEqual(created.id, new_id)
        self.assertEqual(db_get_count(), initial_count + 1)

        # 2. Update status
        updated = db_update_intervention(new_id, status=InterventionStatus.IN_PROGRESS, notes="Updated note")
        self.assertIsNotNone(updated)
        self.assertEqual(updated.status, InterventionStatus.IN_PROGRESS)
        self.assertEqual(updated.notes, "Updated note")

        # 3. Read back
        all_items = db_list_interventions(alert_id="alt-water-001")
        self.assertTrue(any(i.id == new_id for i in all_items))


if __name__ == "__main__":
    unittest.main()
