from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base
from app.db.models.mixins import UUIDPrimaryKeyMixin


class Message(UUIDPrimaryKeyMixin, Base):
    """Inquiry thread message. Not a real-time chat system."""

    __tablename__ = "messages"

    inquiry_id: Mapped[object] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_user_id: Mapped[object | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_from_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    inquiry = relationship("Inquiry", back_populates="messages")
