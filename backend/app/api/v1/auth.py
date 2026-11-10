from typing import Annotated
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import BadRequestException, UnauthorizedException
from app.core.security import create_access_token, get_current_user, verify_password
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserResponse
from app.services import auth_service

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Đăng ký tài khoản mới"""
    user = auth_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise BadRequestException("Email này đã được đăng ký.")
    return auth_service.create_user(db=db, user_in=user_in)


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """Đăng nhập OAuth2 (username = email) để nhận JWT Token"""
    user = auth_service.get_user_by_email(db, email=form_data.username)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise UnauthorizedException("Email hoặc mật khẩu không chính xác.")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    """Lấy thông tin tài khoản của user đang đăng nhập"""
    return current_user
