from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_customer
from app.core.exceptions import AppError
from app.db.models.product import Product
from app.db.models.reservation import Reservation
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.customer import ReservationIn, ReservationOut

router = APIRouter(tags=["Reservations"])


@router.get("/reservations", response_model=list[ReservationOut])
def list_mine(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return db.scalars(
        select(Reservation).where(Reservation.user_id == user.id).order_by(Reservation.created_at.desc())
    ).all()


@router.post("/reservations", response_model=ReservationOut, status_code=201)
def create_reservation(body: ReservationIn, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    product = db.get(Product, body.product_id)
    if product is None or product.status != "PUBLISHED":
        raise AppError(404, "not_found", "Product not found")
    row = Reservation(
        user_id=user.id, product_id=product.id, status="PENDING", customer_note=body.customer_note
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
