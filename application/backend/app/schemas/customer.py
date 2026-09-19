from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class ReservationIn(BaseModel):
    product_id: UUID
    customer_note: str | None = None


class ReservationOut(ORMModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    status: str
    customer_note: str | None
    admin_note: str | None = None
    created_at: datetime | None = None


class ReservationAdminPatch(BaseModel):
    status: str | None = None
    admin_note: str | None = None


class InquiryIn(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1)
    email: EmailStr | None = None
    full_name: str | None = None


class InquiryOut(ORMModel):
    id: UUID
    user_id: UUID | None
    subject: str
    message: str
    status: str
    guest_email: str | None
    guest_name: str | None
    created_at: datetime | None = None


class InquiryAdminPatch(BaseModel):
    status: str | None = None


class MessageIn(BaseModel):
    body: str = Field(min_length=1)


class MessageOut(ORMModel):
    id: UUID
    inquiry_id: UUID
    sender_user_id: UUID | None
    body: str
    is_from_admin: bool
    is_read: bool
    created_at: datetime | None = None


class SavedUnitIn(BaseModel):
    product_id: UUID


class SavedUnitOut(ORMModel):
    id: UUID
    product_id: UUID


class CustomerPatch(BaseModel):
    is_active: bool | None = None
