import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import BigInteger, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.transaction import Transaction
    from app.models.user import User


class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, index=True, autoincrement=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    wallet_name: Mapped[str] = mapped_column(String(100), nullable=False)
    wallet_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # CASH, BANK, E_WALLET
    balance: Mapped[Decimal] = mapped_column(
        Numeric(15, 2), nullable=False, default=0.00
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
    owner: Mapped["User"] = relationship("User", back_populates="wallets")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="wallet", cascade="all, delete-orphan"
    )