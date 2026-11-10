from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services import category_service

router = APIRouter()


@router.get("/", response_model=list[CategoryResponse])
def get_categories(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Lấy danh sách tất cả danh mục (Mặc định + Cá nhân)"""
    return category_service.get_categories_by_user(db=db, user_id=current_user.id)


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Tạo danh mục chi tiêu/thu nhập cá nhân mới"""
    return category_service.create_category(
        db=db, category_in=category_in, user_id=current_user.id
    )


@router.post("/init-defaults", status_code=status.HTTP_200_OK)
def init_default_categories(db: Session = Depends(get_db)):
    """API Khởi tạo danh mục mặc định hệ thống cho sinh viên (Chạy 1 lần)"""
    category_service.seed_default_categories(db=db)
    return {"message": "Khởi tạo danh mục mặc định hệ thống thành công!"}


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Cập nhật danh mục cá nhân"""
    category = category_service.get_category_by_id(
        db=db, category_id=category_id, user_id=current_user.id
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy danh mục."
        )
    if category.user_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không thể sửa danh mục mặc định của hệ thống.",
        )
    return category_service.update_category(
        db=db, db_category=category, category_in=category_in
    )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Xóa danh mục cá nhân"""
    category = category_service.get_category_by_id(
        db=db, category_id=category_id, user_id=current_user.id
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy danh mục."
        )
    if category.user_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không thể xóa danh mục mặc định của hệ thống.",
        )
    category_service.delete_category(db=db, db_category=category)
    return None