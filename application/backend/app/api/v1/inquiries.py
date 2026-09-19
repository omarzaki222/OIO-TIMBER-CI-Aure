from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import optional_user, require_customer
from app.core.exceptions import AppError
from app.db.models.inquiry import Inquiry
from app.db.models.message import Message
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.customer import InquiryIn, InquiryOut, MessageIn, MessageOut

router = APIRouter(tags=["Inquiries"])


def _owned_inquiry(db: Session, inquiry_id: UUID, user: User) -> Inquiry:
    row = db.get(Inquiry, inquiry_id)
    if row is None or row.user_id != user.id:
        raise AppError(404, "not_found", "Inquiry not found")
    return row


@router.post("/inquiries", response_model=InquiryOut, status_code=201)
def create_inquiry(
    body: InquiryIn,
    db: Session = Depends(get_db),
    user: User | None = Depends(optional_user),
):
    row = Inquiry(
        user_id=user.id if user else None,
        subject=body.subject,
        message=body.message,
        guest_email=None if user else (str(body.email) if body.email else None),
        guest_name=None if user else body.full_name,
        status="OPEN",
    )
    db.add(row)
    db.flush()
    db.add(
        Message(
            inquiry_id=row.id,
            sender_user_id=user.id if user else None,
            body=body.message,
            is_from_admin=False,
        )
    )
    db.commit()
    db.refresh(row)
    return row


@router.get("/inquiries", response_model=list[InquiryOut])
def list_my_inquiries(user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return db.scalars(
        select(Inquiry).where(Inquiry.user_id == user.id).order_by(Inquiry.created_at.desc())
    ).all()


@router.get("/inquiries/{inquiry_id}", response_model=InquiryOut)
def get_my_inquiry(inquiry_id: UUID, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return _owned_inquiry(db, inquiry_id, user)


@router.get("/inquiries/{inquiry_id}/messages", response_model=list[MessageOut])
def list_my_messages(inquiry_id: UUID, user: User = Depends(require_customer), db: Session = Depends(get_db)):
    _owned_inquiry(db, inquiry_id, user)
    return db.scalars(
        select(Message).where(Message.inquiry_id == inquiry_id).order_by(Message.created_at)
    ).all()


@router.post("/inquiries/{inquiry_id}/messages", response_model=MessageOut, status_code=201)
def send_my_message(
    inquiry_id: UUID,
    body: MessageIn,
    user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    _owned_inquiry(db, inquiry_id, user)
    msg = Message(
        inquiry_id=inquiry_id,
        sender_user_id=user.id,
        body=body.body,
        is_from_admin=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
