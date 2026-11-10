import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.supplier import Supplier
    from app.models.user import User


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, index=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    supplier_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("suppliers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False)  # IMPORT / EXPORT
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow, index=True
    )

    owner: Mapped["User"] = relationship("User", back_populates="stock_movements")
    product: Mapped["Product"] = relationship("Product", back_populates="stock_movements")
    supplier: Mapped[Optional["Supplier"]] = relationship(
        "Supplier", back_populates="stock_movements"
    )
