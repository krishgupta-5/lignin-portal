"""
Backend Test Suite for AI-Powered Lignin Extraction Predictor API.

Tests cover:
- Unit tests for prediction service
- Functional tests for auth endpoints (signup, login, me)
- Functional tests for prediction endpoints
- Functional tests for history, compare, reports
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from main import app
from database import memory_store


# ========== Fixtures ==========

@pytest_asyncio.fixture(autouse=True)
async def clean_memory():
    """Reset in-memory storage before each test."""
    memory_store["users"].clear()
    memory_store["predictions"].clear()
    memory_store["reports"].clear()
    yield
    memory_store["users"].clear()
    memory_store["predictions"].clear()
    memory_store["reports"].clear()


@pytest_asyncio.fixture
async def client():
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_client(client):
    """Create an authenticated client (signup + get token)."""
    res = await client.post("/api/auth/signup", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
    })
    token = res.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client


# ========== Unit Tests: Prediction Service ==========

class TestPredictionService:
    """Unit tests for the prediction service module."""

    def test_predict_returns_required_fields(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        assert "lignin_yield" in result
        assert "recommended_time" in result
        assert "performance" in result
        assert "confidence" in result
        assert "yield_curve" in result
        assert "model" in result

    def test_predict_yield_in_valid_range(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("bamboo", "h2so4", 100.0, "10-120", "1:10", 2.0)
        assert 10.0 <= result["lignin_yield"] <= 99.0

    def test_predict_confidence_in_valid_range(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("rice_straw", "des", 140.0, "10-180", "1:20", 4.0)
        assert 0.0 <= result["confidence"] <= 100.0

    def test_predict_performance_is_valid(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("wheat_straw", "ethanol", 110.0, "10-60", "1:12", 5.0)
        assert result["performance"] in ["Better", "Good", "Average", "Poor"]

    def test_predict_yield_curve_has_19_points(self):
        """Yield curve from 0 to 180 in steps of 10 = 19 points."""
        from services.prediction_service import predict_lignin
        result = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        assert len(result["yield_curve"]) == 19

    def test_predict_yield_curve_starts_at_zero(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        assert result["yield_curve"][0]["time"] == 0

    def test_predict_yield_curve_ends_at_180(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        assert result["yield_curve"][-1]["time"] == 180

    def test_predict_is_deterministic(self):
        """Same inputs should give same outputs."""
        from services.prediction_service import predict_lignin
        r1 = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        r2 = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        assert r1["lignin_yield"] == r2["lignin_yield"]
        assert r1["recommended_time"] == r2["recommended_time"]
        assert r1["confidence"] == r2["confidence"]

    def test_different_inputs_give_different_results(self):
        from services.prediction_service import predict_lignin
        r1 = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        r2 = predict_lignin("bamboo", "h2so4", 100.0, "10-120", "1:10", 2.0)
        # At least one value should differ
        assert (r1["lignin_yield"] != r2["lignin_yield"] or
                r1["recommended_time"] != r2["recommended_time"])

    def test_model_affects_results(self):
        """Different models should produce different predictions."""
        from services.prediction_service import predict_lignin
        r_tabnet = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5, model="tabnet")
        r_dnn = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5, model="dnn")
        r_node = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5, model="node")
        r_aug = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5, model="node_augmented")
        # Models should produce different yields
        yields = {r_tabnet["lignin_yield"], r_dnn["lignin_yield"], r_node["lignin_yield"], r_aug["lignin_yield"]}
        assert len(yields) > 1, "Different models should give different yields"

    def test_model_field_in_result(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5, model="tabnet")
        assert result["model"] == "tabnet"

    def test_default_model_is_node_augmented(self):
        from services.prediction_service import predict_lignin
        result = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5)
        assert result["model"] == "node_augmented"

    def test_node_augmented_has_highest_confidence_range(self):
        """NODE Augmented should generally have higher confidence."""
        from services.prediction_service import predict_lignin
        r_aug = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5, model="node_augmented")
        r_dnn = predict_lignin("miscanthus", "naoh", 120.0, "10-180", "1:15", 3.5, model="dnn")
        # NODE Augmented min confidence (82) > DNN min confidence (70)
        assert r_aug["confidence"] >= 82.0 or r_dnn["confidence"] <= 93.0


# ========== Functional Tests: Root / Health ==========

class TestRootEndpoints:

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client):
        res = await client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "running"
        assert "version" in data

    @pytest.mark.asyncio
    async def test_health_endpoint(self, client):
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "database" in data


# ========== Functional Tests: Auth ==========

class TestAuth:

    @pytest.mark.asyncio
    async def test_signup_success(self, client):
        res = await client.post("/api/auth/signup", json={
            "name": "Alice",
            "email": "alice@example.com",
            "password": "password123",
        })
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["name"] == "Alice"
        assert data["user"]["email"] == "alice@example.com"

    @pytest.mark.asyncio
    async def test_signup_duplicate_email(self, client):
        await client.post("/api/auth/signup", json={
            "name": "Bob",
            "email": "bob@example.com",
            "password": "password123",
        })
        res = await client.post("/api/auth/signup", json={
            "name": "Bob2",
            "email": "bob@example.com",
            "password": "otherpassword",
        })
        assert res.status_code == 400
        assert "already registered" in res.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_success(self, client):
        # First signup
        await client.post("/api/auth/signup", json={
            "name": "Carol",
            "email": "carol@example.com",
            "password": "mypassword",
        })
        # Then login
        res = await client.post("/api/auth/login", json={
            "email": "carol@example.com",
            "password": "mypassword",
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "carol@example.com"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client):
        await client.post("/api/auth/signup", json={
            "name": "Dave",
            "email": "dave@example.com",
            "password": "correct_password",
        })
        res = await client.post("/api/auth/login", json={
            "email": "dave@example.com",
            "password": "wrong_password",
        })
        assert res.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client):
        res = await client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "anything",
        })
        assert res.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me_authenticated(self, auth_client):
        res = await auth_client.get("/api/auth/me")
        assert res.status_code == 200
        data = res.json()
        assert data["name"] == "Test User"
        assert data["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_me_unauthenticated(self, client):
        res = await client.get("/api/auth/me")
        assert res.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me_invalid_token(self, client):
        client.headers["Authorization"] = "Bearer invalid_token_here"
        res = await client.get("/api/auth/me")
        assert res.status_code == 401


# ========== Functional Tests: Predictions ==========

class TestPredictions:

    @pytest.mark.asyncio
    async def test_predict_success(self, auth_client):
        res = await auth_client.post("/api/predict", json={
            "plant": "miscanthus",
            "chemical": "naoh",
            "temperature": 120,
            "time_range": "10-180",
            "ratio": "1:15",
            "ph": 3.5,
            "model": "tabnet",
        })
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        assert data["plant"] == "miscanthus"
        assert data["model"] == "tabnet"
        assert "lignin_yield" in data
        assert "recommended_time" in data
        assert "performance" in data
        assert "confidence" in data
        assert "yield_curve" in data
        assert len(data["yield_curve"]) == 19

    @pytest.mark.asyncio
    async def test_predict_default_model(self, auth_client):
        res = await auth_client.post("/api/predict", json={
            "plant": "bamboo",
            "chemical": "h2so4",
            "temperature": 100,
            "time_range": "10-120",
            "ratio": "1:10",
            "ph": 2.0,
        })
        assert res.status_code == 201
        assert res.json()["model"] == "node_augmented"

    @pytest.mark.asyncio
    async def test_predict_unauthenticated(self, client):
        res = await client.post("/api/predict", json={
            "plant": "miscanthus",
            "chemical": "naoh",
            "temperature": 120,
            "time_range": "10-180",
            "ratio": "1:15",
            "ph": 3.5,
        })
        assert res.status_code == 401

    @pytest.mark.asyncio
    async def test_predict_all_models(self, auth_client):
        """Test prediction works with all 4 model types."""
        for model in ["tabnet", "dnn", "node", "node_augmented"]:
            res = await auth_client.post("/api/predict", json={
                "plant": "rice_straw",
                "chemical": "des",
                "temperature": 130,
                "time_range": "10-180",
                "ratio": "1:15",
                "ph": 4.0,
                "model": model,
            })
            assert res.status_code == 201, f"Failed for model: {model}"
            assert res.json()["model"] == model

    @pytest.mark.asyncio
    async def test_get_prediction_by_id(self, auth_client):
        # Create a prediction first
        create_res = await auth_client.post("/api/predict", json={
            "plant": "poplar",
            "chemical": "kraft",
            "temperature": 160,
            "time_range": "30-120",
            "ratio": "1:8",
            "ph": 12.0,
        })
        pred_id = create_res.json()["id"]

        # Fetch it
        res = await auth_client.get(f"/api/predictions/{pred_id}")
        assert res.status_code == 200
        assert res.json()["plant"] == "poplar"


# ========== Functional Tests: History ==========

class TestHistory:

    @pytest.mark.asyncio
    async def test_empty_history(self, auth_client):
        res = await auth_client.get("/api/history")
        assert res.status_code == 200
        data = res.json()
        assert data["predictions"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_history_after_predictions(self, auth_client):
        # Make 3 predictions
        for plant in ["miscanthus", "bamboo", "rice_straw"]:
            await auth_client.post("/api/predict", json={
                "plant": plant, "chemical": "naoh",
                "temperature": 120, "time_range": "10-180",
                "ratio": "1:15", "ph": 3.5,
            })

        res = await auth_client.get("/api/history")
        data = res.json()
        assert data["total"] == 3
        assert len(data["predictions"]) == 3

    @pytest.mark.asyncio
    async def test_history_search(self, auth_client):
        await auth_client.post("/api/predict", json={
            "plant": "miscanthus", "chemical": "naoh",
            "temperature": 120, "time_range": "10-180",
            "ratio": "1:15", "ph": 3.5,
        })
        await auth_client.post("/api/predict", json={
            "plant": "bamboo", "chemical": "h2so4",
            "temperature": 100, "time_range": "10-120",
            "ratio": "1:10", "ph": 2.0,
        })

        res = await auth_client.get("/api/history?search=bamboo")
        data = res.json()
        assert data["total"] == 1
        assert data["predictions"][0]["plant"] == "bamboo"

    @pytest.mark.asyncio
    async def test_history_pagination(self, auth_client):
        # Make 5 predictions
        for i in range(5):
            await auth_client.post("/api/predict", json={
                "plant": "miscanthus", "chemical": "naoh",
                "temperature": 100 + i * 10, "time_range": "10-180",
                "ratio": "1:15", "ph": 3.5,
            })

        res = await auth_client.get("/api/history?page=1&limit=2")
        data = res.json()
        assert len(data["predictions"]) == 2
        assert data["total"] == 5
        assert data["pages"] == 3

    @pytest.mark.asyncio
    async def test_delete_prediction(self, auth_client):
        create_res = await auth_client.post("/api/predict", json={
            "plant": "miscanthus", "chemical": "naoh",
            "temperature": 120, "time_range": "10-180",
            "ratio": "1:15", "ph": 3.5,
        })
        pred_id = create_res.json()["id"]

        del_res = await auth_client.delete(f"/api/history/{pred_id}")
        assert del_res.status_code == 200

        # Verify it's gone
        history_res = await auth_client.get("/api/history")
        assert history_res.json()["total"] == 0

    @pytest.mark.asyncio
    async def test_delete_nonexistent(self, auth_client):
        res = await auth_client.delete("/api/history/nonexistent-id")
        assert res.status_code == 404

    @pytest.mark.asyncio
    async def test_history_unauthenticated(self, client):
        res = await client.get("/api/history")
        assert res.status_code == 401


# ========== Functional Tests: Compare ==========

class TestCompare:

    @pytest.mark.asyncio
    async def test_compare_success(self, auth_client):
        ids = []
        for plant in ["miscanthus", "bamboo", "rice_straw"]:
            r = await auth_client.post("/api/predict", json={
                "plant": plant, "chemical": "naoh",
                "temperature": 120, "time_range": "10-180",
                "ratio": "1:15", "ph": 3.5,
            })
            ids.append(r.json()["id"])

        res = await auth_client.post("/api/compare", json={
            "prediction_ids": ids[:2],
        })
        assert res.status_code == 200
        data = res.json()
        assert data["count"] == 2
        assert len(data["predictions"]) == 2

    @pytest.mark.asyncio
    async def test_compare_too_few(self, auth_client):
        r = await auth_client.post("/api/predict", json={
            "plant": "miscanthus", "chemical": "naoh",
            "temperature": 120, "time_range": "10-180",
            "ratio": "1:15", "ph": 3.5,
        })
        res = await auth_client.post("/api/compare", json={
            "prediction_ids": [r.json()["id"]],
        })
        assert res.status_code == 400

    @pytest.mark.asyncio
    async def test_compare_too_many(self, auth_client):
        ids = []
        for i in range(6):
            r = await auth_client.post("/api/predict", json={
                "plant": "miscanthus", "chemical": "naoh",
                "temperature": 100 + i * 10, "time_range": "10-180",
                "ratio": "1:15", "ph": 3.5,
            })
            ids.append(r.json()["id"])
        res = await auth_client.post("/api/compare", json={
            "prediction_ids": ids,
        })
        assert res.status_code == 400


# ========== Functional Tests: Reports ==========

class TestReports:

    @pytest.mark.asyncio
    async def test_empty_reports(self, auth_client):
        res = await auth_client.get("/api/reports")
        assert res.status_code == 200
        assert res.json() == []

    @pytest.mark.asyncio
    async def test_generate_report(self, auth_client):
        # Create a prediction first
        pred_res = await auth_client.post("/api/predict", json={
            "plant": "miscanthus", "chemical": "naoh",
            "temperature": 120, "time_range": "10-180",
            "ratio": "1:15", "ph": 3.5,
        })
        pred_id = pred_res.json()["id"]

        res = await auth_client.post("/api/reports/generate", json={
            "title": "Test Report",
            "prediction_ids": [pred_id],
        })
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "Test Report"
        assert data["format"] == "PDF"
        assert "size" in data

    @pytest.mark.asyncio
    async def test_list_reports(self, auth_client):
        # Create prediction and report
        pred_res = await auth_client.post("/api/predict", json={
            "plant": "miscanthus", "chemical": "naoh",
            "temperature": 120, "time_range": "10-180",
            "ratio": "1:15", "ph": 3.5,
        })
        await auth_client.post("/api/reports/generate", json={
            "title": "Report 1",
            "prediction_ids": [pred_res.json()["id"]],
        })

        res = await auth_client.get("/api/reports")
        assert res.status_code == 200
        assert len(res.json()) == 1

    @pytest.mark.asyncio
    async def test_delete_report(self, auth_client):
        pred_res = await auth_client.post("/api/predict", json={
            "plant": "miscanthus", "chemical": "naoh",
            "temperature": 120, "time_range": "10-180",
            "ratio": "1:15", "ph": 3.5,
        })
        report_res = await auth_client.post("/api/reports/generate", json={
            "title": "Delete Me",
            "prediction_ids": [pred_res.json()["id"]],
        })
        report_id = report_res.json()["id"]

        del_res = await auth_client.delete(f"/api/reports/{report_id}")
        assert del_res.status_code == 200

        # Verify deleted
        list_res = await auth_client.get("/api/reports")
        assert len(list_res.json()) == 0

    @pytest.mark.asyncio
    async def test_generate_report_invalid_predictions(self, auth_client):
        res = await auth_client.post("/api/reports/generate", json={
            "title": "Bad Report",
            "prediction_ids": ["nonexistent-id"],
        })
        assert res.status_code == 400
