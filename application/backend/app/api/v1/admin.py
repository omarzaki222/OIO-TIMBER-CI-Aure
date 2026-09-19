from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.dependencies import require_admin
from app.core.exceptions import AppError
from app.db.models.category import Category
from app.db.models.inquiry import INQUIRY_STATUSES, Inquiry
from app.db.models.message import Message
from app.db.models.product import PRODUCT_STATUSES, Product, ProductImage
from app.db.models.reservation import RESERVATION_STATUSES, Reservation
from app.db.models.role import ROLE_CUSTOMER
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.auth import UserOut
from app.schemas.catalog import (
    CategoryAdminIn,
    CategoryOut,
    ProductAdminIn,
    ProductAdminPatch,
    ProductImageIn,
    ProductOut,
)
from app.schemas.customer import (
    CustomerPatch,
    InquiryAdminPatch,
    InquiryOut,
    MessageIn,
    MessageOut,
    ReservationAdminPatch,
    ReservationOut,
)
from app.services import auth as auth_svc

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    return {
        "products": db.scalar(select(func.count()).select_from(Product)) or 0,
        "published_products": db.scalar(
            select(func.count()).select_from(Product).where(Product.status == "PUBLISHED")
        )
        or 0,
        "customers": db.scalar(
            select(func.count()).select_from(User).where(User.role.has(code=ROLE_CUSTOMER))
        )
        or 0,
        "pending_reservations": db.scalar(
            select(func.count()).select_from(Reservation).where(Reservation.status == "PENDING")
        )
        or 0,
        "reservations": db.scalar(select(func.count()).select_from(Reservation)) or 0,
        "open_inquiries": db.scalar(select(func.count()).select_from(Inquiry).where(Inquiry.status == "OPEN")) or 0,
    }


@router.get("/categories", response_model=list[CategoryOut])
def admin_categories(db: Session = Depends(get_db)):
    return db.scalars(select(Category).order_by(Category.sort_order)).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(body: CategoryAdminIn, db: Session = Depends(get_db)):
    row = Category(**body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: UUID, body: CategoryAdminIn, db: Session = Depends(get_db)):
    row = db.get(Category, category_id)
    if row is None:
        raise AppError(404, "not_found", "Category not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.get("/categories/{category_id}", response_model=CategoryOut)
def get_category(category_id: UUID, db: Session = Depends(get_db)):
    row = db.get(Category, category_id)
    if row is None:
        raise AppError(404, "not_found", "Category not found")
    return row


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: UUID, db: Session = Depends(get_db)):
    row = db.get(Category, category_id)
    if row is None:
        raise AppError(404, "not_found", "Category not found")
    db.delete(row)
    db.commit()


@router.get("/products", response_model=list[ProductOut])
def admin_products(db: Session = Depends(get_db)):
    return db.scalars(select(Product).options(selectinload(Product.images)).order_by(Product.name)).all()


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(body: ProductAdminIn, db: Session = Depends(get_db)):
    if body.status not in PRODUCT_STATUSES:
        raise AppError(422, "validation_error", "Invalid product status")
    row = Product(**body.model_dump())
    db.add(row)
    db.commit()
    return db.scalar(select(Product).options(selectinload(Product.images)).where(Product.id == row.id))


def _product(db: Session, product_id: UUID) -> Product:
    row = db.scalar(select(Product).options(selectinload(Product.images)).where(Product.id == product_id))
    if row is None:
        raise AppError(404, "not_found", "Product not found")
    return row


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    return _product(db, product_id)


@router.patch("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: UUID, body: ProductAdminPatch, db: Session = Depends(get_db)):
    row = db.get(Product, product_id)
    if row is None:
        raise AppError(404, "not_found", "Product not found")
    data = body.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in PRODUCT_STATUSES:
        raise AppError(422, "validation_error", "Invalid product status")
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    return _product(db, product_id)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: UUID, db: Session = Depends(get_db)):
    row = db.get(Product, product_id)
    if row is None:
        raise AppError(404, "not_found", "Product not found")
    reserved = db.scalar(select(func.count()).select_from(Reservation).where(Reservation.product_id == product_id)) or 0
    if reserved:
        raise AppError(409, "conflict", "Unit has reservations and cannot be deleted")
    db.delete(row)
    db.commit()


@router.post("/products/{product_id}/images", response_model=ProductOut, status_code=201)
def add_image(product_id: UUID, body: ProductImageIn, db: Session = Depends(get_db)):
    if db.get(Product, product_id) is None:
        raise AppError(404, "not_found", "Product not found")
    db.add(ProductImage(product_id=product_id, **body.model_dump()))
    db.commit()
    return _product(db, product_id)


@router.delete("/products/{product_id}/images/{image_id}", response_model=ProductOut)
def delete_image(product_id: UUID, image_id: UUID, db: Session = Depends(get_db)):
    img = db.get(ProductImage, image_id)
    if img is None or img.product_id != product_id:
        raise AppError(404, "not_found", "Image not found")
    db.delete(img)
    db.commit()
    return _product(db, product_id)


@router.get("/customers", response_model=list[UserOut])
def customers(db: Session = Depends(get_db)):
    users = db.scalars(select(User).options(joinedload(User.role)).where(User.role.has(code=ROLE_CUSTOMER))).all()
    return [UserOut.model_validate(auth_svc.user_public(u)) for u in users]


@router.get("/customers/{user_id}", response_model=UserOut)
def get_customer(user_id: UUID, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).options(joinedload(User.role)).where(User.id == user_id, User.role.has(code=ROLE_CUSTOMER))
    )
    if user is None:
        raise AppError(404, "not_found", "Customer not found")
    return UserOut.model_validate(auth_svc.user_public(user))


@router.patch("/customers/{user_id}", response_model=UserOut)
def patch_customer(user_id: UUID, body: CustomerPatch, db: Session = Depends(get_db)):
    user = db.scalar(select(User).options(joinedload(User.role)).where(User.id == user_id))
    if user is None:
        raise AppError(404, "not_found", "Customer not found")
    if body.is_active is not None:
        user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(auth_svc.user_public(user))


@router.get("/reservations", response_model=list[ReservationOut])
def admin_reservations(db: Session = Depends(get_db)):
    return db.scalars(select(Reservation).order_by(Reservation.created_at.desc())).all()


@router.get("/reservations/{reservation_id}", response_model=ReservationOut)
def get_reservation(reservation_id: UUID, db: Session = Depends(get_db)):
    row = db.get(Reservation, reservation_id)
    if row is None:
        raise AppError(404, "not_found", "Reservation not found")
    return row


@router.patch("/reservations/{reservation_id}", response_model=ReservationOut)
def patch_reservation(reservation_id: UUID, body: ReservationAdminPatch, db: Session = Depends(get_db)):
    row = db.get(Reservation, reservation_id)
    if row is None:
        raise AppError(404, "not_found", "Reservation not found")
    if body.status:
        if body.status not in RESERVATION_STATUSES:
            raise AppError(422, "validation_error", "Invalid reservation status")
        row.status = body.status
    if body.admin_note is not None:
        row.admin_note = body.admin_note
    db.commit()
    db.refresh(row)
    return row


@router.get("/inquiries", response_model=list[InquiryOut])
def admin_inquiries(db: Session = Depends(get_db)):
    return db.scalars(select(Inquiry).order_by(Inquiry.created_at.desc())).all()


@router.get("/inquiries/{inquiry_id}", response_model=InquiryOut)
def get_inquiry(inquiry_id: UUID, db: Session = Depends(get_db)):
    row = db.get(Inquiry, inquiry_id)
    if row is None:
        raise AppError(404, "not_found", "Inquiry not found")
    return row


@router.patch("/inquiries/{inquiry_id}", response_model=InquiryOut)
def patch_inquiry(inquiry_id: UUID, body: InquiryAdminPatch, db: Session = Depends(get_db)):
    row = db.get(Inquiry, inquiry_id)
    if row is None:
        raise AppError(404, "not_found", "Inquiry not found")
    if body.status:
        if body.status not in INQUIRY_STATUSES:
            raise AppError(422, "validation_error", "Invalid inquiry status")
        row.status = body.status
    db.commit()
    db.refresh(row)
    return row


@router.get("/messages", response_model=list[MessageOut])
def admin_messages(inquiry_id: UUID | None = Query(default=None), db: Session = Depends(get_db)):
    q = select(Message).order_by(Message.created_at)
    if inquiry_id:
        q = q.where(Message.inquiry_id == inquiry_id)
    return db.scalars(q).all()


@router.post("/inquiries/{inquiry_id}/messages", response_model=MessageOut, status_code=201)
def reply_inquiry(inquiry_id: UUID, body: MessageIn, user: User = Depends(require_admin), db: Session = Depends(get_db)):
    if db.get(Inquiry, inquiry_id) is None:
        raise AppError(404, "not_found", "Inquiry not found")
    msg = Message(inquiry_id=inquiry_id, sender_user_id=user.id, body=body.body, is_from_admin=True)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
