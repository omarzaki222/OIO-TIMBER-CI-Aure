from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import hash_password
from app.db.models.role import ROLE_ADMIN, Role
from app.db.models.user import User


def test_health(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_ready(client: TestClient):
    r = client.get("/ready")
    assert r.status_code == 200


def test_signup_and_me(client: TestClient):
    r = client.post(
        "/api/v1/auth/signup",
        json={"email": "ada@example.com", "password": "password12", "first_name": "Ada"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["user"]["role"] == "CUSTOMER"
    token = body["access_token"]
    me = client.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "ada@example.com"


def test_duplicate_email(client: TestClient):
    payload = {"email": "dup@example.com", "password": "password12"}
    assert client.post("/api/v1/auth/signup", json=payload).status_code == 200
    assert client.post("/api/v1/auth/signup", json=payload).status_code == 409


def test_login_and_invalid_password(client: TestClient):
    client.post("/api/v1/auth/signup", json={"email": "lee@example.com", "password": "password12"})
    assert client.post("/api/v1/auth/login", json={"email": "lee@example.com", "password": "password12"}).status_code == 200
    assert client.post("/api/v1/auth/login", json={"email": "lee@example.com", "password": "wrongpass"}).status_code == 401


def test_products_public(client: TestClient):
    listed = client.get("/api/v1/products")
    assert listed.status_code == 200
    data = listed.json()
    assert data["total"] >= 1
    slug = data["items"][0]["slug"]
    assert client.get(f"/api/v1/products/slug/{slug}").status_code == 200
    assert client.get(f"/api/v1/products/{data['items'][0]['id']}").status_code == 200


def test_reservation_isolation(client: TestClient):
    a = client.post("/api/v1/auth/signup", json={"email": "a@example.com", "password": "password12"}).json()
    b = client.post("/api/v1/auth/signup", json={"email": "b@example.com", "password": "password12"}).json()
    pid = client.get("/api/v1/products").json()["items"][0]["id"]
    created = client.post(
        "/api/v1/reservations",
        json={"product_id": pid, "customer_note": "Please call"},
        headers={"Authorization": f"Bearer {a['access_token']}"},
    )
    assert created.status_code == 201
    mine = client.get("/api/v1/reservations", headers={"Authorization": f"Bearer {a['access_token']}"})
    other = client.get("/api/v1/reservations", headers={"Authorization": f"Bearer {b['access_token']}"})
    assert len(mine.json()) == 1
    assert other.json() == []
    ha = {"Authorization": f"Bearer {a['access_token']}"}
    hb = {"Authorization": f"Bearer {b['access_token']}"}
    assert client.post("/api/v1/saved-units", json={"product_id": pid}, headers=ha).status_code == 201
    assert len(client.get("/api/v1/saved-units", headers=ha).json()) == 1
    assert client.get("/api/v1/saved-units", headers=hb).json() == []
    assert client.delete(f"/api/v1/saved-units/{pid}", headers=hb).status_code == 404


def test_customer_cannot_hit_admin(client: TestClient):
    token = client.post(
        "/api/v1/auth/signup", json={"email": "cust@example.com", "password": "password12"}
    ).json()["access_token"]
    assert client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"}).status_code == 403


def test_saved_unit_unique(client: TestClient):
    token = client.post(
        "/api/v1/auth/signup", json={"email": "save@example.com", "password": "password12"}
    ).json()["access_token"]
    pid = client.get("/api/v1/products").json()["items"][0]["id"]
    h = {"Authorization": f"Bearer {token}"}
    assert client.post("/api/v1/saved-units", json={"product_id": pid}, headers=h).status_code == 201
    assert client.post("/api/v1/saved-units", json={"product_id": pid}, headers=h).status_code == 409


def test_admin_ok(client: TestClient, db):
    role = db.scalar(select(Role).where(Role.code == ROLE_ADMIN))
    db.add(
        User(
            role_id=role.id,
            email="admin@example.com",
            password_hash=hash_password("password12"),
            first_name="Ops",
            is_active=True,
        )
    )
    db.commit()
    token = client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "password12"}
    ).json()["access_token"]
    dash = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert dash.status_code == 200
    assert "products" in dash.json()


def _auth(client: TestClient, email: str) -> dict:
    return client.post(
        "/api/v1/auth/signup", json={"email": email, "password": "password12"}
    ).json()


def test_inquiry_threads_own_and_isolation(client: TestClient):
    a = _auth(client, "inq-a@example.com")
    b = _auth(client, "inq-b@example.com")
    ha = {"Authorization": f"Bearer {a['access_token']}"}
    hb = {"Authorization": f"Bearer {b['access_token']}"}

    created = client.post(
        "/api/v1/inquiries",
        json={"subject": "Oak finish", "message": "Can you confirm the oil?"},
        headers=ha,
    )
    assert created.status_code == 201
    iid = created.json()["id"]

    listed = client.get("/api/v1/inquiries", headers=ha)
    assert listed.status_code == 200
    assert len(listed.json()) == 1
    assert listed.json()[0]["id"] == iid
    assert client.get("/api/v1/inquiries", headers=hb).json() == []
    assert client.get("/api/v1/inquiries").status_code == 401

    assert client.get(f"/api/v1/inquiries/{iid}", headers=ha).status_code == 200
    forbidden = client.get(f"/api/v1/inquiries/{iid}", headers=hb)
    assert forbidden.status_code == 404
    assert "id" not in forbidden.json() or forbidden.json().get("id") != iid
    assert "error" in forbidden.json()

    msgs = client.get(f"/api/v1/inquiries/{iid}/messages", headers=ha)
    assert msgs.status_code == 200
    assert len(msgs.json()) >= 1
    assert client.get(f"/api/v1/inquiries/{iid}/messages", headers=hb).status_code == 404

    sent = client.post(
        f"/api/v1/inquiries/{iid}/messages",
        json={"body": "Also, lead time?"},
        headers=ha,
    )
    assert sent.status_code == 201
    assert sent.json()["body"] == "Also, lead time?"
    assert client.post(
        f"/api/v1/inquiries/{iid}/messages",
        json={"body": "intrusion"},
        headers=hb,
    ).status_code == 404


def test_customer_e2e_flow(client: TestClient):
    home_cats = client.get("/api/v1/categories")
    assert home_cats.status_code == 200
    products = client.get("/api/v1/products")
    assert products.status_code == 200
    pid = products.json()["items"][0]["id"]
    slug = products.json()["items"][0]["slug"]
    assert client.get(f"/api/v1/products/slug/{slug}").status_code == 200

    token = client.post(
        "/api/v1/auth/signup",
        json={"email": "flow@example.com", "password": "password12", "first_name": "Nour"},
    ).json()["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/v1/me", headers=h).json()["email"] == "flow@example.com"

    assert client.post("/api/v1/saved-units", json={"product_id": pid}, headers=h).status_code == 201
    assert len(client.get("/api/v1/saved-units", headers=h).json()) == 1

    res = client.post("/api/v1/reservations", json={"product_id": pid, "customer_note": "For the salon"}, headers=h)
    assert res.status_code == 201
    assert client.get("/api/v1/reservations", headers=h).json()[0]["status"] == "PENDING"

    inq = client.post("/api/v1/inquiries", json={"subject": "Lead time", "message": "When can it ship?"}, headers=h)
    iid = inq.json()["id"]
    assert client.get("/api/v1/inquiries", headers=h).json()[0]["id"] == iid
    assert client.get(f"/api/v1/inquiries/{iid}", headers=h).status_code == 200
    assert len(client.get(f"/api/v1/inquiries/{iid}/messages", headers=h).json()) >= 1
    assert client.post(f"/api/v1/inquiries/{iid}/messages", json={"body": "Thank you"}, headers=h).status_code == 201

    login = client.post("/api/v1/auth/login", json={"email": "flow@example.com", "password": "password12"})
    h2 = {"Authorization": f"Bearer {login.json()['access_token']}"}
    assert len(client.get("/api/v1/reservations", headers=h2).json()) == 1
    assert len(client.get("/api/v1/saved-units", headers=h2).json()) == 1
    assert len(client.get("/api/v1/inquiries", headers=h2).json()) == 1
