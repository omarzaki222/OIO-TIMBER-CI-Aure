from fastapi import APIRouter

from app.api.v1 import admin, auth, catalog, inquiries, reservations, saved, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(catalog.router)
api_router.include_router(reservations.router)
api_router.include_router(inquiries.router)
api_router.include_router(saved.router)
api_router.include_router(admin.router)
