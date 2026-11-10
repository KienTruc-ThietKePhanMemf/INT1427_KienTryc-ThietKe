import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.category import CategoryResponse


class ProductBase(BaseModel):
    category_id: int = Field(...)
    sku: str = Field(..., min_length=1, max_length=50)
    product_name: str = Field(..., min_length=1, max_length=150)
    unit: str = Field(..., min_length=1, max_length=30)
    buy_price: Decimal = Field(..., ge=0)
    sell_price: Decimal = Field(..., ge=0)
    min_threshold: int = Field(default=5, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_id: int | None = None
    sku: str | None = Field(None, min_length=1, max_length=50)
    product_name: str | None = Field(None, min_length=1, max_length=150)
    unit: str | None = Field(None, min_length=1, max_length=30)
    buy_price: Decimal | None = Field(None, ge=0)
    sell_price: Decimal | None = Field(None, ge=0)
    min_threshold: int | None = Field(None, ge=0)


class ProductAdjust(BaseModel):
    real_quantity: int = Field(..., ge=0)
    reason: str | None = Field(None, max_length=255)


class ProductResponse(ProductBase):
    id: int
    user_id: int
    stock_quantity: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    category: CategoryResponse | None = None

    class Config:
        from_attributes = True
