from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service

router = APIRouter()


@router.get("/", response_model=list[ProductResponse])
def get_products(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    category_id: int | None = Query(None),
    low_stock: bool = Query(False, description="Lọc SP có tồn <= ngưỡng tối thiểu"),
):
    """Lấy danh sách sản phẩm. Lọc theo category_id và/hoặc low_stock."""
    return product_service.get_products(
        db=db,
        user_id=current_user.id,
        category_id=category_id,
        low_stock=low_stock,
    )


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Tạo sản phẩm mới (tồn kho mặc định = 0)"""
    return product_service.create_product(
        db=db, product_in=product_in, user_id=current_user.id
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(
    product_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Lấy chi tiết 1 sản phẩm"""
    product = product_service.get_product_by_id(
        db=db, product_id=product_id, user_id=current_user.id
    )
    if not product:
        raise NotFoundException("Không tìm thấy sản phẩm.")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin sản phẩm (không sửa tồn kho trực tiếp)"""
    return product_service.update_product(
        db=db,
        product_id=product_id,
        product_in=product_in,
        user_id=current_user.id,
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Xóa sản phẩm"""
    product_service.delete_product(
        db=db, product_id=product_id, user_id=current_user.id
    )
    return None
