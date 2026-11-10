import datetime
from pydantic import BaseModel, EmailStr, Field


class SupplierBase(BaseModel):
    supplier_name: str = Field(..., min_length=1, max_length=150)
    phone: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    address: str | None = Field(None, max_length=255)


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    supplier_name: str | None = Field(None, min_length=1, max_length=150)
    phone: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    address: str | None = Field(None, max_length=255)


class SupplierResponse(SupplierBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
