from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.dependencies import get_current_user, refresh_cookie
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.auth import LoginIn, SignupIn, TokenOut, UserOut
from app.services import auth as auth_svc

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_refresh(response: Response, raw: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=raw,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path=settings.refresh_cookie_path,
        max_age=settings.jwt_refresh_token_expire_days * 24 * 3600,
    )


def _clear_refresh(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(settings.refresh_cookie_name, path=settings.refresh_cookie_path)


@router.post("/signup", response_model=TokenOut, summary="Register a CUSTOMER account")
def signup(body: SignupIn, request: Request, response: Response, db: Session = Depends(get_db)):
    user = auth_svc.signup(db, body.email, body.password, body.first_name, body.last_name, body.phone)
    access, raw = auth_svc.issue_tokens(
        db, user, request.headers.get("user-agent"), request.client.host if request.client else None
    )
    _set_refresh(response, raw)
    return TokenOut(access_token=access, user=UserOut.model_validate(auth_svc.user_public(user)))


@router.post("/login", response_model=TokenOut, summary="Sign in")
def login(body: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    user = auth_svc.authenticate(db, body.email, body.password)
    access, raw = auth_svc.issue_tokens(
        db, user, request.headers.get("user-agent"), request.client.host if request.client else None
    )
    _set_refresh(response, raw)
    return TokenOut(access_token=access, user=UserOut.model_validate(auth_svc.user_public(user)))


@router.post("/refresh", response_model=TokenOut, summary="Rotate refresh cookie")
def refresh(request: Request, response: Response, db: Session = Depends(get_db), raw: str | None = Depends(refresh_cookie)):
    access, new_raw, user = auth_svc.rotate_refresh(
        db, raw or "", request.headers.get("user-agent"), request.client.host if request.client else None
    )
    _set_refresh(response, new_raw)
    return TokenOut(access_token=access, user=UserOut.model_validate(auth_svc.user_public(user)))


@router.post("/logout", summary="Revoke refresh session")
def logout(response: Response, db: Session = Depends(get_db), raw: str | None = Depends(refresh_cookie)):
    auth_svc.revoke_refresh(db, raw)
    _clear_refresh(response)
    return {"ok": True}
