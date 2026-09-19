from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.db.base import Base
from app.db.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

RESERVATION_STATUSES = ("PENDING", "CONTACTED", "CONFIRMED", "CANCELLED", "COMPLETED")


class Reservation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Customer request for a unit. Not a payment checkout."""

    __tablename__ = "reservations"

    user_id: Mapped[object] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    product_id: Mapped[object] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", index=True)
    customer_note: Mapped[str | None] = mapped_column(Text)
    admin_note: Mapped[str | None] = mapped_column(Text)

    user = relationship("User", back_populates="reservations")
    product = relationship("Product", back_populates="reservations")
