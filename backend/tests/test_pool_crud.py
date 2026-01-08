"""
Tests for Klinik Ritmi Content Pool CRUD operations
"""
import pytest
from httpx import AsyncClient, ASGITransport
import asyncio
from server import app
from db.mongodb import connect_to_mongo, get_database


@pytest.fixture(scope="module")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="module")
async def async_client():
    await connect_to_mongo()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def auth_token(async_client):
    """Get auth token for admin user"""
    response = await async_client.post(
        "/api/auth/login",
        json={"email": "admin@wetnose.com.tr", "password": "WetnoseStage2026!"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    """Create auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestPoolStats:
    @pytest.mark.asyncio
    async def test_get_pool_stats(self, async_client, auth_headers):
        """Test pool stats endpoint"""
        response = await async_client.get(
            "/api/admin/clinic-rhythm/pool/stats",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_questions" in data
        assert "total_alarms" in data
        assert "active_questions" in data
        assert "active_alarms" in data
        assert "total_combinations" in data
        assert data["total_combinations"] == data["active_questions"] * data["active_alarms"]


class TestQuestionPoolCRUD:
    @pytest.mark.asyncio
    async def test_list_questions(self, async_client, auth_headers):
        """Test listing questions from pool"""
        response = await async_client.get(
            "/api/admin/clinic-rhythm/pool/questions",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert "total" in data
        assert len(data["questions"]) > 0

    @pytest.mark.asyncio
    async def test_list_questions_with_category_filter(self, async_client, auth_headers):
        """Test filtering questions by category"""
        response = await async_client.get(
            "/api/admin/clinic-rhythm/pool/questions?category=kedi",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        for q in data["questions"]:
            assert q["category"] == "kedi"

    @pytest.mark.asyncio
    async def test_create_question(self, async_client, auth_headers):
        """Test creating a new question"""
        response = await async_client.post(
            "/api/admin/clinic-rhythm/pool/questions",
            headers=auth_headers,
            json={
                "question_text": "Test Sorusu - Pytest",
                "short_answer": "Bu bir test cevabıdır. Pytest ile oluşturuldu.",
                "category": "genel"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Soru oluşturuldu"
        return data["id"]

    @pytest.mark.asyncio
    async def test_update_question(self, async_client, auth_headers):
        """Test updating a question"""
        # First create a question
        create_response = await async_client.post(
            "/api/admin/clinic-rhythm/pool/questions",
            headers=auth_headers,
            json={
                "question_text": "Güncelleme Testi Sorusu",
                "short_answer": "Bu soru güncellenecek.",
                "category": "kedi"
            }
        )
        question_id = create_response.json()["id"]

        # Update the question
        update_response = await async_client.put(
            f"/api/admin/clinic-rhythm/pool/questions/{question_id}",
            headers=auth_headers,
            json={
                "question_text": "Güncellenmiş Soru Metni",
                "short_answer": "Bu soru güncellendi.",
                "status": "inactive"
            }
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["question_text"] == "Güncellenmiş Soru Metni"
        assert data["status"] == "inactive"

        # Cleanup
        await async_client.delete(
            f"/api/admin/clinic-rhythm/pool/questions/{question_id}",
            headers=auth_headers
        )

    @pytest.mark.asyncio
    async def test_delete_question(self, async_client, auth_headers):
        """Test deleting a question"""
        # First create a question
        create_response = await async_client.post(
            "/api/admin/clinic-rhythm/pool/questions",
            headers=auth_headers,
            json={
                "question_text": "Silinecek Soru",
                "short_answer": "Bu soru silinecek.",
                "category": "kopek"
            }
        )
        question_id = create_response.json()["id"]

        # Delete the question
        delete_response = await async_client.delete(
            f"/api/admin/clinic-rhythm/pool/questions/{question_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Soru silindi"

        # Verify deletion
        get_response = await async_client.get(
            f"/api/admin/clinic-rhythm/pool/questions/{question_id}",
            headers=auth_headers
        )
        assert get_response.status_code == 404


class TestAlarmPoolCRUD:
    @pytest.mark.asyncio
    async def test_list_alarms(self, async_client, auth_headers):
        """Test listing alarms from pool"""
        response = await async_client.get(
            "/api/admin/clinic-rhythm/pool/alarms",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "alarms" in data
        assert "total" in data
        assert len(data["alarms"]) > 0

    @pytest.mark.asyncio
    async def test_create_alarm(self, async_client, auth_headers):
        """Test creating a new alarm"""
        response = await async_client.post(
            "/api/admin/clinic-rhythm/pool/alarms",
            headers=auth_headers,
            json={
                "message_title": "Test Alarm",
                "message_body": "Bu bir test alarm mesajıdır.",
                "supportive_line": "Endişelenmeyin, bu bir testtir.",
                "category": "fiziksel"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Alarm oluşturuldu"

        # Cleanup
        await async_client.delete(
            f"/api/admin/clinic-rhythm/pool/alarms/{data['id']}",
            headers=auth_headers
        )

    @pytest.mark.asyncio
    async def test_update_alarm(self, async_client, auth_headers):
        """Test updating an alarm"""
        # First create an alarm
        create_response = await async_client.post(
            "/api/admin/clinic-rhythm/pool/alarms",
            headers=auth_headers,
            json={
                "message_title": "Güncelleme Testi",
                "message_body": "Bu alarm güncellenecek.",
                "supportive_line": "Test supportive line.",
                "category": "davranissal"
            }
        )
        alarm_id = create_response.json()["id"]

        # Update the alarm
        update_response = await async_client.put(
            f"/api/admin/clinic-rhythm/pool/alarms/{alarm_id}",
            headers=auth_headers,
            json={
                "message_title": "Güncellenmiş Alarm Başlığı"
            }
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["message_title"] == "Güncellenmiş Alarm Başlığı"

        # Cleanup
        await async_client.delete(
            f"/api/admin/clinic-rhythm/pool/alarms/{alarm_id}",
            headers=auth_headers
        )

    @pytest.mark.asyncio
    async def test_delete_alarm(self, async_client, auth_headers):
        """Test deleting an alarm"""
        # First create an alarm
        create_response = await async_client.post(
            "/api/admin/clinic-rhythm/pool/alarms",
            headers=auth_headers,
            json={
                "message_title": "Silinecek Alarm",
                "message_body": "Bu alarm silinecek.",
                "supportive_line": "Test.",
                "category": "mevsimsel"
            }
        )
        alarm_id = create_response.json()["id"]

        # Delete the alarm
        delete_response = await async_client.delete(
            f"/api/admin/clinic-rhythm/pool/alarms/{alarm_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Alarm silindi"


class TestPublicClinicRhythm:
    @pytest.mark.asyncio
    async def test_get_today_rhythm(self, async_client):
        """Test public endpoint returns content from pool"""
        response = await async_client.get("/api/public/clinic-rhythm/today")
        assert response.status_code == 200
        data = response.json()
        assert "date_key" in data
        assert "featured_question" in data
        assert "false_alarm" in data
        
        # Verify question structure
        if data["featured_question"]:
            assert "question_text" in data["featured_question"]
            assert "short_answer" in data["featured_question"]
        
        # Verify alarm structure
        if data["false_alarm"]:
            assert "message_title" in data["false_alarm"]
            assert "message_body" in data["false_alarm"]
            assert "supportive_line" in data["false_alarm"]
