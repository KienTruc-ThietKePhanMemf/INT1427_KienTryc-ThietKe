import datetime
from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.product import ProductResponse
from app.schemas.supplier import SupplierResponse


class StockImportCreate(BaseModel):
    product_id: int = Field(...)
    supplier_id: int = Field(...)
    quantity: int = Field(..., gt=0)
    note: str | None = Field(None, max_length=255)


class StockExportCreate(BaseModel):
    product_id: int = Field(...)
    quantity: int = Field(..., gt=0)
    note: str | None = Field(None, max_length=255)


class StockMovementResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    supplier_id: int | None
    movement_type: Literal["IMPORT", "EXPORT"]
    quantity: int
    note: str | None
    created_at: datetime.datetime
    product: ProductResponse | None = None
    supplier: SupplierResponse | None = None

    class Config:
        from_attributes = True
