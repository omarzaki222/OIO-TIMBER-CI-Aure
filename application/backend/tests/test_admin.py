from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import hash_password
from app.db.models.role import ROLE_ADMIN, Role
from app.db.models.user import User


def _admin_token(client: TestClient, db) -> str:
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
    return client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "password12"}
    ).json()["access_token"]


def test_customer_rejected_from_admin_write(client: TestClient):
    token = client.post(
        "/api/v1/auth/signup", json={"email": "cust@example.com", "password": "password12"}
    ).json()["access_token"]
    h = {"Authorization": f"Bearer {token}"}
    pid = client.get("/api/v1/products").json()["items"][0]["id"]
    assert client.post("/api/v1/admin/products", json={"name": "x"}, headers=h).status_code == 403
    assert client.get("/api/v1/admin/customers", headers=h).status_code == 403
    assert client.patch(
        f"/api/v1/admin/products/{pid}", json={"status": "ARCHIVED"}, headers=h
    ).status_code == 403


def test_admin_dashboard_and_catalog(client: TestClient, db):
    h = {"Authorization": f"Bearer {_admin_token(client, db)}"}
    dash = client.get("/api/v1/admin/dashboard", headers=h)
    assert dash.status_code == 200
    body = dash.json()
    for key in (
        "products",
        "published_products",
        "customers",
        "pending_reservations",
        "reservations",
        "open_inquiries",
    ):
        assert key in body

    cats = client.get("/api/v1/admin/categories", headers=h).json()
    assert len(cats) >= 1
    cid = cats[0]["id"]
    assert client.get(f"/api/v1/admin/categories/{cid}", headers=h).status_code == 200

    created = client.post(
        "/api/v1/admin/products",
        json={
            "category_id": cid,
            "name": "Studio Console",
            "slug": "studio-console",
            "status": "DRAFT",
            "price_on_request": True,
        },
        headers=h,
    )
    assert created.status_code == 201
    pid = created.json()["id"]
    assert client.get(f"/api/v1/admin/products/{pid}", headers=h).json()["status"] == "DRAFT"
    pub = client.patch(f"/api/v1/admin/products/{pid}", json={"status": "PUBLISHED"}, headers=h)
    assert pub.status_code == 200
    assert pub.json()["status"] == "PUBLISHED"

    img = client.post(
        f"/api/v1/admin/products/{pid}/images",
        json={"image_url": "https://placehold.co/400", "is_primary": True},
        headers=h,
    )
    assert img.status_code == 201
    iid = img.json()["images"][0]["id"]
    assert client.delete(f"/api/v1/admin/products/{pid}/images/{iid}", headers=h).status_code == 200
    assert client.delete(f"/api/v1/admin/products/{pid}", headers=h).status_code == 204


def test_admin_reservations_and_inquiries(client: TestClient, db):
    h = {"Authorization": f"Bearer {_admin_token(client, db)}"}
    cust = client.post(
        "/api/v1/auth/signup", json={"email": "pat@example.com", "password": "password12", "first_name": "Pat"}
    ).json()
    ch = {"Authorization": f"Bearer {cust['access_token']}"}
    pid = client.get("/api/v1/products").json()["items"][0]["id"]
    res = client.post("/api/v1/reservations", json={"product_id": pid, "customer_note": "Window"}, headers=ch)
    rid = res.json()["id"]
    listed = client.get("/api/v1/admin/reservations", headers=h)
    assert listed.status_code == 200
    assert client.get(f"/api/v1/admin/reservations/{rid}", headers=h).status_code == 200
    patched = client.patch(
        f"/api/v1/admin/reservations/{rid}",
        json={"status": "CONTACTED", "admin_note": "Called"},
        headers=h,
    )
    assert patched.status_code == 200
    assert patched.json()["status"] == "CONTACTED"

    inq = client.post("/api/v1/inquiries", json={"subject": "Finish", "message": "Oil?"}, headers=ch)
    iid = inq.json()["id"]
    assert client.get("/api/v1/admin/inquiries", headers=h).status_code == 200
    assert client.get(f"/api/v1/admin/inquiries/{iid}", headers=h).status_code == 200
    msgs = client.get("/api/v1/admin/messages", headers=h, params={"inquiry_id": iid})
    assert msgs.status_code == 200
    reply = client.post(
        f"/api/v1/admin/inquiries/{iid}/messages",
        json={"body": "Natural oil, two coats."},
        headers=h,
    )
    assert reply.status_code == 201
    assert reply.json()["is_from_admin"] is True
    assert client.patch(f"/api/v1/admin/inquiries/{iid}", json={"status": "IN_PROGRESS"}, headers=h).json()[
        "status"
    ] == "IN_PROGRESS"

    uid = cust["user"]["id"]
    assert client.get(f"/api/v1/admin/customers/{uid}", headers=h).status_code == 200
    assert "password_hash" not in client.get("/api/v1/admin/customers", headers=h).json()[0]
