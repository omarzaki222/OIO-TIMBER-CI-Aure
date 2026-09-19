from uuid import UUID

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_customer
from app.core.exceptions import AppError
from app.db.models.product import Product
from app.db.models.saved_unit import SavedUnit
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.customer import SavedUnitIn, SavedUnitOut

router = APIRouter(tags=["Saved units"])


@router.get("/saved-units", response_model=list[SavedUnitOut])
def list_saved(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return db.scalars(select(SavedUnit).where(SavedUnit.user_id == user.id)).all()


@router.post("/saved-units", response_model=SavedUnitOut, status_code=201)
def save_unit(body: SavedUnitIn, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    product = db.get(Product, body.product_id)
    if product is None or product.status != "PUBLISHED":
        raise AppError(404, "not_found", "Product not found")
    existing = db.scalar(
        select(SavedUnit).where(SavedUnit.user_id == user.id, SavedUnit.product_id == body.product_id)
    )
    if existing:
        raise AppError(409, "conflict", "Unit already saved")
    row = SavedUnit(user_id=user.id, product_id=body.product_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/saved-units/{product_id}", status_code=204)
def unsave(product_id: UUID, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    row = db.scalar(select(SavedUnit).where(SavedUnit.user_id == user.id, SavedUnit.product_id == product_id))
    if row is None:
        raise AppError(404, "not_found", "Saved unit not found")
    db.delete(row)
    db.commit()
    return Response(status_code=204)
