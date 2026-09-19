from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.core.security import (
    create_access_token,
    hash_password,
    hash_refresh_token,
    new_refresh_token,
    verify_password,
)
from app.db.models.role import ROLE_CUSTOMER, Role
from app.db.models.session import SessionToken
from app.db.models.user import User


def user_public(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": user.role.code,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


def get_role(db: Session, code: str) -> Role:
    role = db.scalar(select(Role).where(Role.code == code))
    if role is None:
        raise AppError(500, "misconfigured", f"Role {code} is missing")
    return role


def signup(
    db: Session, email: str, password: str, first_name: str | None, last_name: str | None, phone: str | None
) -> User:
    email_n = email.lower().strip()
    if db.scalar(select(User).where(User.email == email_n)):
        raise AppError(409, "conflict", "Email already registered")
    user = User(
        role_id=get_role(db, ROLE_CUSTOMER).id,
        email=email_n,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        is_active=True,
    )
    db.add(user)
    db.commit()
    return db.scalar(select(User).options(joinedload(User.role)).where(User.id == user.id))


def authenticate(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).options(joinedload(User.role)).where(User.email == email.lower().strip()))
    if user is None or not verify_password(password, user.password_hash):
        raise AppError(401, "unauthorized", "Invalid email or password")
    if not user.is_active:
        raise AppError(403, "forbidden", "Account is disabled")
    return user


def issue_tokens(db: Session, user: User, user_agent: str | None, ip: str | None) -> tuple[str, str]:
    settings = get_settings()
    access = create_access_token(user_id=user.id, role=user.role.code)
    raw = new_refresh_token()
    db.add(
        SessionToken(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(raw),
            expires_at=datetime.now(UTC) + timedelta(days=settings.jwt_refresh_token_expire_days),
            revoked=False,
            user_agent=user_agent,
            ip=ip,
        )
    )
    db.commit()
    return access, raw


def rotate_refresh(db: Session, raw: str, user_agent: str | None, ip: str | None) -> tuple[str, str, User]:
    if not raw:
        raise AppError(401, "unauthorized", "Invalid refresh token")
    digest = hash_refresh_token(raw)
    session = db.scalar(select(SessionToken).where(SessionToken.refresh_token_hash == digest))
    if session is None or session.revoked or session.expires_at < datetime.now(UTC):
        raise AppError(401, "unauthorized", "Invalid refresh token")
    session.revoked = True
    user = db.scalar(select(User).options(joinedload(User.role)).where(User.id == session.user_id))
    if user is None or not user.is_active:
        raise AppError(401, "unauthorized", "Invalid refresh token")
    access, new_raw = issue_tokens(db, user, user_agent, ip)
    return access, new_raw, user


def revoke_refresh(db: Session, raw: str | None) -> None:
    if not raw:
        return
    session = db.scalar(select(SessionToken).where(SessionToken.refresh_token_hash == hash_refresh_token(raw)))
    if session:
        session.revoked = True
        db.commit()
