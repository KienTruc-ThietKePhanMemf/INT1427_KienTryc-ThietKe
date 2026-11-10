import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.stock_movement import StockMovement
    from app.models.user import User


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, index=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    product_name: Mapped[str] = mapped_column(String(150), nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)  # Cái / Hộp / Kg ...
    buy_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    sell_price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    min_threshold: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    owner: Mapped["User"] = relationship("User", back_populates="products")
    category: Mapped["Category"] = relationship("Category", back_populates="products")
    stock_movements: Mapped[list["StockMovement"]] = relationship(
        "StockMovement", back_populates="product", cascade="all, delete-orphan"
    )
