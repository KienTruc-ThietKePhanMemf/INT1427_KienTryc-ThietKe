import datetime
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=100)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    category_name: str | None = Field(None, min_length=1, max_length=100)


class CategoryResponse(CategoryBase):
    id: int
    user_id: int | None  # NULL nếu là danh mục mặc định hệ thống
    created_at: datetime.datetime

    class Config:
        from_attributes = True
