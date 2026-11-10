import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.category import CategoryResponse
from app.schemas.wallet import WalletResponse


class TransactionBase(BaseModel):
    wallet_id: int = Field(...)
    category_id: int = Field(...)
    transaction_type: Literal["INCOME", "EXPENSE"] = Field(...)
    amount: Decimal = Field(..., gt=0)
    description: str | None = Field(None, max_length=255)
    transaction_date: datetime.date = Field(
        default_factory=datetime.date.today)


# Request Body khi Tạo Giao dịch
class TransactionCreate(TransactionBase):
    pass


# Request Body khi Sửa Giao dịch
class TransactionUpdate(BaseModel):
    wallet_id: int | None = None
    category_id: int | None = None
    transaction_type: Literal["INCOME", "EXPENSE"] | None = None
    amount: Decimal | None = Field(None, gt=0)
    description: str | None = Field(None, max_length=255)
    transaction_date: datetime.date | None = None


# Response DTO trả về Giao dịch (Có kèm thông tin Ví & Danh mục)
class TransactionResponse(BaseModel):
    id: int
    user_id: int
    wallet_id: int
    category_id: int
    transaction_type: Literal["INCOME", "EXPENSE"]
    amount: Decimal
    description: str | None
    transaction_date: datetime.date
    created_at: datetime.datetime
    updated_at: datetime.datetime

    # Include nested info gọn nhẹ cho Frontend hiển thị
    wallet: WalletResponse | None = None
    category: CategoryResponse | None = None

    class Config:
        from_attributes = True
