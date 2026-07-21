"""
Backend regression tests for Faz 2-5 admin panel refactor + related public endpoints.
Covers: role-based auth (admin/manager/reception/editor), message→appointment convert,
single-source settings, blog↔service and team↔service relations, admin blog CRUD + status/restore,
system health, and public pages 200.
"""
import os
import time
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:3000").rstrip("/")
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "wetnose_db")

CREDS = {
    "admin": ("admin@wetnose.com.tr", "WetnoseStage2026!"),
    "manager": ("manager@wetnose.com.tr", "Manager2026!"),
    "reception": ("reception@wetnose.com.tr", "Reception2026!"),
    "editor": ("editor@wetnose.com.tr", "Editor2026!"),
}

TEST_PHONE = "0555 000 11 22"
TEST_EMAIL_PREFIX = "TEST_convert_"

_tokens = {}
_created = {"messages": [], "appointments": [], "blog_posts": []}


def _login(role):
    if role in _tokens:
        return _tokens[role]
    email, pw = CREDS[role]
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": pw})
    assert r.status_code == 200, f"Login failed for {role}: {r.status_code} {r.text[:200]}"
    data = r.json()
    tok = data.get("access_token") or data.get("token") or (data.get("data") or {}).get("access_token")
    assert tok, f"No token in login response for {role}: {data}"
    _tokens[role] = tok
    return tok


def _h(role):
    return {"Authorization": f"Bearer {_login(role)}"}


# ---------- ROLE / AUTH ----------
@pytest.mark.parametrize("role", ["admin", "manager", "reception", "editor"])
def test_login_all_roles(role):
    tok = _login(role)
    assert isinstance(tok, str) and len(tok) > 10


def test_editor_forbidden_on_crm_appointments():
    r = requests.get(f"{BASE_URL}/api/admin/crm/appointments", headers=_h("editor"))
    assert r.status_code == 403, f"Editor should be 403 on crm; got {r.status_code}"


def test_manager_can_access_crm_appointments():
    r = requests.get(f"{BASE_URL}/api/admin/crm/appointments", headers=_h("manager"))
    assert r.status_code == 200, f"Manager should access CRM appointments; got {r.status_code} {r.text[:200]}"


def test_manager_can_access_contact_messages():
    r = requests.get(f"{BASE_URL}/api/admin/contact/messages", headers=_h("manager"))
    assert r.status_code == 200


def test_reception_can_access_crm():
    r = requests.get(f"{BASE_URL}/api/admin/crm/appointments", headers=_h("reception"))
    assert r.status_code == 200


def test_editor_forbidden_on_contact_messages():
    r = requests.get(f"{BASE_URL}/api/admin/contact/messages", headers=_h("editor"))
    assert r.status_code == 403


# ---------- PUBLIC SETTINGS single source of truth ----------
def test_public_settings_phone_whatsapp():
    r = requests.get(f"{BASE_URL}/api/public/settings")
    assert r.status_code == 200
    payload = r.json()
    s = payload.get("data") or payload
    assert s.get("phone") == "0262 321 33 53"
    assert s.get("whatsapp") == "905449386673"


@pytest.mark.parametrize("path", [
    "/", "/hakkimizda", "/hizmetler", "/ekibimiz", "/galeri",
    "/iletisim", "/randevu", "/saglik-rehberi", "/geri-bildirim",
])
def test_public_pages_200(path):
    r = requests.get(f"{BASE_URL}{path}", timeout=15)
    assert r.status_code == 200, f"{path} -> {r.status_code}"
    # Legacy phone must NOT appear on any page
    assert "0553 484" not in r.text, f"Legacy phone leaked on {path}"


def test_public_iletisim_shows_current_phone():
    r = requests.get(f"{BASE_URL}/iletisim", timeout=15)
    assert "0262 321 33 53" in r.text or "02623213353" in r.text.replace(" ", "")


# ---------- BLOG ↔ SERVICE, TEAM ↔ SERVICE ----------
def test_service_laboratuvar_has_related_blog_and_providers():
    r = requests.get(f"{BASE_URL}/api/public/services/laboratuvar")
    assert r.status_code == 200
    payload = r.json()
    data = payload.get("data") or payload
    related = data.get("related_blog_posts") or []
    providers = data.get("providers") or []
    slugs = [p.get("slug") for p in related]
    provider_slugs = [p.get("slug") for p in providers]
    assert "kedi-beslenmesi-rehberi" in slugs, f"blog not linked: {slugs}"
    assert "hasan-murat-turkan" in provider_slugs, f"provider missing: {provider_slugs}"


def test_service_page_renders_related_sections():
    r = requests.get(f"{BASE_URL}/hizmetler/laboratuvar", timeout=15)
    assert r.status_code == 200
    # Providers / related blog markers (Turkish text)
    assert "Uzmanlar" in r.text or "Verdiği" in r.text or "Hasan Murat" in r.text
    assert "kedi-beslenmesi-rehberi" in r.text or "Kedi Beslenmesi" in r.text


def test_blog_detail_shows_related_services():
    r = requests.get(f"{BASE_URL}/saglik-rehberi/kedi-beslenmesi-rehberi", timeout=15)
    assert r.status_code == 200
    assert "laboratuvar" in r.text.lower() or "Laboratuvar" in r.text
    assert "Randevu" in r.text


# ---------- SYSTEM HEALTH ----------
def test_system_health_endpoint():
    r = requests.get(f"{BASE_URL}/api/admin/system-health", headers=_h("admin"))
    assert r.status_code == 200
    data = r.json()
    body = data.get("data") or data
    assert "issues" in body or "checks" in body or isinstance(body, dict)


# ---------- ADMIN BLOG CRUD + status + restore ----------
def test_admin_blog_list():
    r = requests.get(f"{BASE_URL}/api/admin/blog", headers=_h("admin"))
    assert r.status_code == 200
    d = r.json()
    posts = d.get("data") or d.get("posts") or d
    if isinstance(posts, dict):
        posts = posts.get("items") or posts.get("posts") or []
    assert isinstance(posts, list)
    assert len(posts) >= 1


def test_admin_blog_full_lifecycle():
    payload = {
        "title": "TEST_ Regression Blog",
        "slug": f"test-regression-{int(time.time())}",
        "excerpt": "Test excerpt",
        "content": "<p>Test body</p>",
        "status": "draft",
        "category": "genel",
    }
    r = requests.post(f"{BASE_URL}/api/admin/blog", headers=_h("admin"), json=payload)
    assert r.status_code in (200, 201), f"Create failed: {r.status_code} {r.text[:300]}"
    body = r.json()
    post = body.get("data") or body.get("post") or body
    post_id = post.get("id") or post.get("_id") or post.get("post_id")
    assert post_id, f"no id in create response: {body}"
    _created["blog_posts"].append(post_id)

    # publish via /status
    r = requests.patch(
        f"{BASE_URL}/api/admin/blog/{post_id}/status",
        headers=_h("admin"),
        json={"status": "published"},
    )
    assert r.status_code in (200, 204), f"status PATCH failed: {r.status_code} {r.text[:200]}"

    # Public listing should include it
    time.sleep(1)
    r = requests.get(f"{BASE_URL}/api/public/blog")
    assert r.status_code == 200
    listing_text = r.text
    assert payload["slug"] in listing_text or "TEST_ Regression" in listing_text

    # Archive (soft delete)
    r = requests.delete(f"{BASE_URL}/api/admin/blog/{post_id}", headers=_h("admin"))
    assert r.status_code in (200, 204)

    # Restore
    r = requests.post(f"{BASE_URL}/api/admin/blog/{post_id}/restore", headers=_h("admin"))
    assert r.status_code in (200, 204), f"restore failed: {r.status_code} {r.text[:200]}"


# ---------- MESSAGE → APPOINTMENT E2E ----------
def test_message_convert_e2e():
    # 1) Create public message
    msg_payload = {
        "name": "TEST_Convert",
        "email": f"{TEST_EMAIL_PREFIX}{int(time.time())}@example.com",
        "phone": TEST_PHONE,
        "subject": "Test convert",
        "message": "Randevu almak istiyorum, test",
    }
    r = requests.post(f"{BASE_URL}/api/contact", json=msg_payload)
    assert r.status_code in (200, 201), f"contact submit failed: {r.status_code} {r.text[:200]}"
    body = r.json()
    m = body.get("data") or body
    msg_id = m.get("id") or m.get("_id") or m.get("message_id")
    if not msg_id:
        # fetch list and find
        r2 = requests.get(f"{BASE_URL}/api/admin/contact/messages", headers=_h("admin"))
        items = r2.json().get("data") or r2.json().get("messages") or []
        if isinstance(items, dict):
            items = items.get("items") or []
        for it in items:
            if it.get("email") == msg_payload["email"]:
                msg_id = it.get("id") or it.get("_id")
                break
    assert msg_id, "No message id after create"
    _created["messages"].append(msg_id)

    # 2) Convert to appointment
    r = requests.post(
        f"{BASE_URL}/api/admin/contact/messages/{msg_id}/convert",
        headers=_h("admin"),
        json={"notes": "Test convert"},
    )
    assert r.status_code in (200, 201), f"convert failed: {r.status_code} {r.text[:300]}"
    conv = r.json()
    conv_data = conv.get("data") or conv
    appt_id = conv_data.get("appointment_id") or (conv_data.get("appointment") or {}).get("id")
    if appt_id:
        _created["appointments"].append(appt_id)

    # 3) Duplicate convert -> 409
    r = requests.post(
        f"{BASE_URL}/api/admin/contact/messages/{msg_id}/convert",
        headers=_h("admin"),
        json={},
    )
    assert r.status_code == 409, f"expected 409 for repeat convert, got {r.status_code} {r.text[:200]}"

    # 4) Second message same phone -> requires_confirmation
    msg2 = dict(msg_payload)
    msg2["email"] = f"{TEST_EMAIL_PREFIX}dup{int(time.time())}@example.com"
    r = requests.post(f"{BASE_URL}/api/contact", json=msg2)
    assert r.status_code in (200, 201)
    b2 = r.json().get("data") or r.json()
    msg_id2 = b2.get("id") or b2.get("_id") or b2.get("message_id")
    if not msg_id2:
        r2 = requests.get(f"{BASE_URL}/api/admin/contact/messages", headers=_h("admin"))
        items = r2.json().get("data") or r2.json().get("messages") or []
        if isinstance(items, dict):
            items = items.get("items") or []
        for it in items:
            if it.get("email") == msg2["email"]:
                msg_id2 = it.get("id") or it.get("_id")
                break
    assert msg_id2
    _created["messages"].append(msg_id2)

    r = requests.post(
        f"{BASE_URL}/api/admin/contact/messages/{msg_id2}/convert",
        headers=_h("admin"),
        json={},
    )
    # Expect either 409/400 requires_confirmation OR 200 with requires_confirmation flag
    if r.status_code == 200:
        data = r.json().get("data") or r.json()
        assert data.get("requires_confirmation") is True or data.get("duplicates"), \
            f"expected requires_confirmation flag: {data}"
    else:
        assert r.status_code in (409, 400, 422), f"unexpected: {r.status_code} {r.text[:200]}"
        payload = r.json()
        text = str(payload).lower()
        assert "confirm" in text or "duplicate" in text or "mükerrer" in text

    # 5) Force convert
    r = requests.post(
        f"{BASE_URL}/api/admin/contact/messages/{msg_id2}/convert",
        headers=_h("admin"),
        json={"force": True},
    )
    assert r.status_code in (200, 201), f"force convert failed: {r.status_code} {r.text[:200]}"
    conv2 = r.json().get("data") or r.json()
    appt_id2 = conv2.get("appointment_id") or (conv2.get("appointment") or {}).get("id")
    if appt_id2:
        _created["appointments"].append(appt_id2)


# ---------- CLEANUP ----------
def test_zzz_cleanup():
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    # Delete created messages
    for mid in _created["messages"]:
        db.contact_messages.delete_one({"id": mid})
        db.contact_messages.delete_one({"_id": mid})
    # Delete any message matching test phone/email prefix
    db.contact_messages.delete_many({"phone": TEST_PHONE})
    db.contact_messages.delete_many({"email": {"$regex": f"^{TEST_EMAIL_PREFIX}"}})
    # Delete appointments
    for aid in _created["appointments"]:
        db.appointments.delete_one({"id": aid})
        db.appointments.delete_one({"_id": aid})
    db.appointments.delete_many({"phone": TEST_PHONE})
    db.appointments.delete_many({"source_email": {"$regex": f"^{TEST_EMAIL_PREFIX}"}})
    # Delete blog posts
    for pid in _created["blog_posts"]:
        db.blog_posts.delete_one({"id": pid})
        db.blog_posts.delete_one({"_id": pid})
    db.blog_posts.delete_many({"title": {"$regex": "^TEST_"}})
    db.blog_posts.delete_many({"slug": {"$regex": "^test-regression-"}})
    client.close()
