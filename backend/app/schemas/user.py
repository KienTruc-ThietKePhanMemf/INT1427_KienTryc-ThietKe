import datetime
from pydantic import BaseModel, EmailStr, Field


# Base Schema chứa các trường chung
class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr = Field(...)


# Request Body khi Đăng ký
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=50)


# Request Body khi Đăng nhập
class UserLogin(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(...)


# Request Body khi Cập nhật Profile
class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=100)


# Request Body khi Đổi mật khẩu
class ChangePassword(BaseModel):
    old_password: str = Field(...)
    new_password: str = Field(..., min_length=6, max_length=50)


# Response DTO trả về thông tin User
class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# Response DTO khi Đăng nhập thành công (JWT Token)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserResponse
