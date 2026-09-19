from uuid import UUID

import jwt
from fastapi import Cookie, Depends, Header
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.db.models.role import ROLE_ADMIN, ROLE_CUSTOMER
from app.db.models.user import User
from app.db.session import get_db


def _load_user(db: Session, user_id: UUID) -> User | None:
    return db.scalar(select(User).options(joinedload(User.role)).where(User.id == user_id))


def _user_from_bearer(authorization: str | None, db: Session) -> User | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except jwt.InvalidTokenError as exc:
        raise AppError(401, "unauthorized", "Invalid or expired access token") from exc
    if payload.get("type") != "access":
        raise AppError(401, "unauthorized", "Invalid access token")
    user = _load_user(db, UUID(payload["sub"]))
    if user is None or not user.is_active:
        raise AppError(401, "unauthorized", "Invalid user")
    return user


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> User:
    user = _user_from_bearer(authorization, db)
    if user is None:
        raise AppError(401, "unauthorized", "Authentication required")
    return user


def require_customer(user: User = Depends(get_current_user)) -> User:
    if user.role.code not in {ROLE_CUSTOMER, ROLE_ADMIN}:
        raise AppError(403, "forbidden", "Customer access required")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role.code != ROLE_ADMIN:
        raise AppError(403, "forbidden", "Admin access required")
    return user


def optional_user(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> User | None:
    if not authorization:
        return None
    return _user_from_bearer(authorization, db)


def refresh_cookie(
    oio_refresh: str | None = Cookie(default=None, alias="oio_refresh"),
) -> str | None:
    _ = get_settings
    return oio_refresh
