from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base
from app.db.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

INQUIRY_STATUSES = ("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED")
INQUIRY_STATUSES = INQUIRY_STATUSES


class Inquiry(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "inquiries"

    user_id: Mapped[object | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="OPEN", index=True)
    guest_email: Mapped[str | None] = mapped_column(String(320))
    guest_name: Mapped[str | None] = mapped_column(String(200))

    user = relationship("User", back_populates="inquiries")
    messages = relationship("Message", back_populates="inquiry", cascade="all, delete-orphan")
