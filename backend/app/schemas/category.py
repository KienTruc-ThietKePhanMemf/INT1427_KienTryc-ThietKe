import datetime
from typing import Literal
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=100)
    category_type: Literal["INCOME", "EXPENSE"] = Field(...)
    icon: str | None = Field(None, max_length=50)


# Request Body khi Tạo Danh mục cá nhân
class CategoryCreate(CategoryBase):
    pass


# Request Body khi Cập nhật Danh mục
class CategoryUpdate(BaseModel):
    category_name: str | None = Field(None, min_length=1, max_length=100)
    icon: str | None = None


# Response DTO trả về Danh mục
class CategoryResponse(CategoryBase):
    id: int
    user_id: int | None  # NULL nếu là danh mục mặc định hệ thống
    created_at: datetime.datetime

    class Config:
        from_attributes = True