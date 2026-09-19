from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.auth import UserOut
from app.services import auth as auth_svc

router = APIRouter(tags=["Users"])


@router.get("/me", response_model=UserOut, summary="Current authenticated user")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.scalar(select(User).options(joinedload(User.role)).where(User.id == user.id))
    return UserOut.model_validate(auth_svc.user_public(user))
