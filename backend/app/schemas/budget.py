import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.category import CategoryResponse


class BudgetBase(BaseModel):
    category_id: int | None = Field(None)  # NULL nếu là Ngân sách tổng
    amount: Decimal = Field(..., gt=0)
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2024)


# Request Body khi Tạo / Cập nhật Ngân sách
class BudgetCreate(BudgetBase):
    pass


# Response DTO Ngân sách kèm Tiến độ Chi tiêu
class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    category: CategoryResponse | None = None

    # Tính toán động trả về cho Frontend
    spent_amount: Decimal = Decimal("0.00")
    remaining_amount: Decimal = Decimal("0.00")
    percentage_used: float = 0.0
    is_warning: bool = False  # True nếu >= 80%
    is_exceeded: bool = False  # True nếu > 100%

    class Config:
        from_attributes = True
