from sqlalchemy import ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime, Uuid

from app.db.base import Base
from app.db.models.mixins import UUIDPrimaryKeyMixin


class SavedUnit(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "saved_units"
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_saved_units_user_product"),)

    user_id: Mapped[object] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[object] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[object] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user = relationship("User", back_populates="saved_units")
    product = relationship("Product")
