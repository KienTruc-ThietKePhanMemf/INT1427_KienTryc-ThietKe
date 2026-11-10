import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User
    from app.models.wallet import Wallet


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, index=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    wallet_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    transaction_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # INCOME, EXPENSE
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    transaction_date: Mapped[datetime.date] = mapped_column(
        Date, nullable=False, default=datetime.date.today
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="transactions")
    wallet: Mapped["Wallet"] = relationship(
        "Wallet", back_populates="transactions"
    )
    category: Mapped["Category"] = relationship(
        "Category", back_populates="transactions"
    )