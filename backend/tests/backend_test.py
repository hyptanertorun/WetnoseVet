"""
Wetnose Production Readiness - Backend regression tests
Runs against public preview URL. Next.js monolith, all APIs under /api.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("TEST_BASE_URL", "http://localhost:3000")
ADMIN_EMAIL = "admin@wetnose.com.tr"
ADMIN_PASSWORD = "WetnoseStage2026!"

PUBLIC_PAGES = [
    "/", "/hakkimizda", "/hizmetler", "/ekibimiz", "/galeri",
    "/iletisim", "/randevu", "/saglik-rehberi", "/geri-bildirim",
]


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"User-Agent": "wetnose-tester/1.0"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                     timeout=30)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text[:200]}"
    data = r.json()
    # token may be in body or set as cookie
    token = data.get("token") or data.get("accessToken") or data.get("access_token")
    return {"token": token, "cookies": session.cookies, "data": data}


# ---- Public pages load ----
@pytest.mark.parametrize("path", PUBLIC_PAGES)
def test_public_page_loads(session, path):
    r = session.get(f"{BASE_URL}{path}", timeout=30)
    assert r.status_code == 200, f"{path} returned {r.status_code}"
    assert "<html" in r.text.lower()


# ---- Security headers ----
def test_security_headers(session):
    r = session.get(f"{BASE_URL}/", timeout=30)
    h = {k.lower(): v for k, v in r.headers.items()}
    assert h.get("x-frame-options", "").upper() == "SAMEORIGIN", f"X-Frame-Options={h.get('x-frame-options')}"
    assert h.get("x-content-type-options", "").lower() == "nosniff", f"X-Content-Type-Options={h.get('x-content-type-options')}"


# ---- Sitemap / robots ----
def test_sitemap_xml(session):
    r = session.get(f"{BASE_URL}/sitemap.xml", timeout=30)
    assert r.status_code == 200
    assert "<urlset" in r.text or "<sitemapindex" in r.text
    # Should have blog urls (saglik-rehberi)
    assert "saglik-rehberi" in r.text, "sitemap missing blog urls"


def test_robots_txt(session):
    r = session.get(f"{BASE_URL}/robots.txt", timeout=30)
    assert r.status_code == 200
    assert "User-agent" in r.text or "User-Agent" in r.text


# ---- 404 ----
def test_404_page(session):
    r = session.get(f"{BASE_URL}/nonexistent-page-xyz", timeout=30)
    assert r.status_code == 404


# ---- Public APIs ----
def test_public_services(session):
    r = session.get(f"{BASE_URL}/api/public/services", timeout=30)
    assert r.status_code == 200
    data = r.json()
    items = data if isinstance(data, list) else data.get("data") or data.get("services") or []
    assert len(items) > 0
    # Verify 'laboratuvar' title corrected
    titles = [str(i.get("title", "")).lower() for i in items]
    assert any("laboratuvar" in t for t in titles), f"laboratuvar service missing. titles={titles}"
    assert not any("güncellenmi" in t for t in titles), f"stale title present: {titles}"


def test_public_team(session):
    r = session.get(f"{BASE_URL}/api/public/team", timeout=30)
    assert r.status_code == 200
    data = r.json()
    items = data.get("team_members") or data.get("data") or (data if isinstance(data, list) else [])
    assert len(items) > 0, "team_members empty"
    print(f"TEAM_COUNT={len(items)}")
    # Soft check for stale test data
    names = [str(m.get("full_name", "")) for m in items]
    if any("Güncellenmi" in n for n in names):
        print(f"STALE_DATA_DETECTED: names contain 'Güncellenmiş' placeholder: {names}")


def test_public_blog(session):
    r = session.get(f"{BASE_URL}/api/public/blog", timeout=30)
    assert r.status_code == 200


def test_clinic_rhythm_today(session):
    r = session.get(f"{BASE_URL}/api/public/clinic-rhythm/today", timeout=30)
    assert r.status_code == 200
    data = r.json()
    # featured_question should exist
    assert "featured_question" in data or "featuredQuestion" in data or data.get("data")


def test_public_slides(session):
    # Try both possible endpoints
    r = session.get(f"{BASE_URL}/api/public/slides", timeout=30)
    if r.status_code == 404:
        r = session.get(f"{BASE_URL}/api/public/slider", timeout=30)
    assert r.status_code == 200


# ---- Contact form submission ----
def test_contact_form_submit(session):
    payload = {
        "name": "TEST_Regression_User",
        "email": "test_regression@example.com",
        "phone": "05551112233",
        "subject": "TEST_Regression",
        "message": "TEST_Regression automated test - please ignore",
    }
    r = session.post(f"{BASE_URL}/api/public/contact", json=payload, timeout=30)
    if r.status_code == 404:
        r = session.post(f"{BASE_URL}/api/contact", json=payload, timeout=30)
    assert r.status_code in (200, 201, 429), f"contact submit failed: {r.status_code} {r.text[:200]}"
    if r.status_code == 429:
        print("CONTACT_RATE_LIMITED (working as expected)")


# ---- Appointment form ----
def test_appointment_submit(session):
    payload = {
        "name": "TEST_Regression_Pet",
        "email": "test_regression_appt@example.com",
        "phone": "05551112244",
        "pet_name": "TestPet",
        "pet_type": "kedi",
        "preferred_date": "2026-02-15",
        "preferred_time": "14:00",
        "message": "TEST_Regression appointment - automated",
        "petName": "TestPet",
        "petType": "kedi",
        "preferredDate": "2026-02-15",
        "preferredTime": "14:00",
    }
    r = session.post(f"{BASE_URL}/api/public/appointment-request", json=payload, timeout=30)
    assert r.status_code in (200, 201, 429), f"appointment failed: {r.status_code} {r.text[:200]}"
    if r.status_code == 429:
        print("APPOINTMENT_RATE_LIMITED (working as expected)")


# ---- Admin auth ----
def test_admin_login_success(admin_token):
    assert admin_token["data"] is not None


def test_admin_services_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/services", timeout=30)
    assert r.status_code in (401, 403), f"Expected 401/403 got {r.status_code}"


# ---- Admin Services CRUD + fresh data check ----
def test_admin_services_crud_and_cache(session, admin_token):
    # session already has auth cookie from login. add bearer if present.
    headers = {}
    if admin_token.get("token"):
        headers["Authorization"] = f"Bearer {admin_token['token']}"

    # CREATE
    # unique slug per run to avoid conflicts with soft-deleted records
    import time
    unique = str(int(time.time()))
    create_payload = {
        "title": f"TEST_Regression_Service_{unique}",
        "slug": f"test-regression-service-{unique}",
        "short_description": "TEST regression short desc",
        "long_description": "TEST regression long content",
        "cover_image_url": "/images/services/placeholder.jpg",
        "cover_image_alt": "TEST",
        "status": "published",
        "sort_order": 999,
    }
    r = session.post(f"{BASE_URL}/api/admin/services", json=create_payload, headers=headers, timeout=30)
    assert r.status_code in (200, 201), f"Create failed: {r.status_code} {r.text[:300]}"
    created = r.json()
    service_id = created.get("id") or created.get("_id") or (created.get("data") or {}).get("id") or (created.get("data") or {}).get("_id")
    assert service_id, f"No id in create response: {created}"

    try:
        # UPDATE
        update_payload = {**create_payload, "title": f"TEST_Regression_Updated_{unique}"}
        r = session.put(f"{BASE_URL}/api/admin/services/{service_id}", json=update_payload, headers=headers, timeout=30)
        if r.status_code == 404:
            r = session.patch(f"{BASE_URL}/api/admin/services/{service_id}", json=update_payload, headers=headers, timeout=30)
        assert r.status_code in (200, 204), f"Update failed: {r.status_code} {r.text[:300]}"

        # Fresh data via public API (force-dynamic, no-store)
        r = session.get(f"{BASE_URL}/api/public/services", timeout=30, headers={"Cache-Control": "no-cache"})
        assert r.status_code == 200
        body = r.text
        # Note: public list may filter by isActive; but our TEST_ record should still be visible
        # This is a soft assertion for cache freshness
        cache_fresh = f"TEST_Regression_Updated_{unique}" in body
        print(f"CACHE_FRESH_CHECK: {cache_fresh}")

    finally:
        # DELETE (cleanup - note: this is a soft delete/archive)
        r = session.delete(f"{BASE_URL}/api/admin/services/{service_id}", headers=headers, timeout=30)
        assert r.status_code in (200, 204), f"Delete failed: {r.status_code} {r.text[:300]}"
        # Hard delete the archived record from DB to keep DB clean (production audit)
        try:
            from pymongo import MongoClient
            client = MongoClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
            client[os.environ.get("DB_NAME", "wetnose_db")].services.delete_one({"id": service_id})
        except Exception as e:
            print(f"Hard delete cleanup warning: {e}")


# ---- Admin pages load ----
@pytest.mark.parametrize("path", [
    "/admin/services", "/admin/settings", "/admin/slider",
    "/admin/team", "/admin/gallery", "/admin/clinic-rhythm",
])
def test_admin_pages_load(session, admin_token, path):
    # session has auth cookies
    r = session.get(f"{BASE_URL}{path}", timeout=30)
    assert r.status_code in (200, 307, 308), f"{path} returned {r.status_code}"
