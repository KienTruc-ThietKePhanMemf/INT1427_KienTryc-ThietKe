from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierResponse, SupplierUpdate
from app.services import supplier_service

router = APIRouter()


@router.get("/", response_model=list[SupplierResponse])
def get_suppliers(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Lấy danh sách nhà cung cấp của user hiện tại"""
    return supplier_service.get_suppliers_by_user(db=db, user_id=current_user.id)


@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_in: SupplierCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Tạo nhà cung cấp mới"""
    return supplier_service.create_supplier(
        db=db, supplier_in=supplier_in, user_id=current_user.id
    )


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier_detail(
    supplier_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Lấy chi tiết 1 nhà cung cấp"""
    supplier = supplier_service.get_supplier_by_id(
        db=db, supplier_id=supplier_id, user_id=current_user.id
    )
    if not supplier:
        raise NotFoundException("Không tìm thấy nhà cung cấp.")
    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    supplier_in: SupplierUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin nhà cung cấp"""
    return supplier_service.update_supplier(
        db=db,
        supplier_id=supplier_id,
        supplier_in=supplier_in,
        user_id=current_user.id,
    )


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
    supplier_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Xóa nhà cung cấp"""
    supplier_service.delete_supplier(
        db=db, supplier_id=supplier_id, user_id=current_user.id
    )
    return None
