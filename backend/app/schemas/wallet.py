import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field


class WalletBase(BaseModel):
    wallet_name: str = Field(..., min_length=1, max_length=100)
    wallet_type: Literal["CASH", "BANK", "E_WALLET"] = Field(...)


# Request Body khi Tạo Ví
class WalletCreate(WalletBase):
    initial_balance: Decimal = Field(default=Decimal("0.00"), ge=0)


# Request Body khi Sửa Ví
class WalletUpdate(BaseModel):
    wallet_name: str | None = Field(None, min_length=1, max_length=100)
    wallet_type: Literal["CASH", "BANK", "E_WALLET"] | None = None


# Response DTO trả về Ví
class WalletResponse(WalletBase):
    id: int
    user_id: int
    balance: Decimal
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True