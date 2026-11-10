from typing import Annotated, Literal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.stock_movement import (
    StockExportCreate,
    StockImportCreate,
    StockMovementResponse,
)
from app.services import stock_service

router = APIRouter()


@router.get("/", response_model=list[StockMovementResponse])
def get_stock_movements(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    product_id: int | None = None,
    supplier_id: int | None = None,
    movement_type: Literal["IMPORT", "EXPORT"] | None = None,
):
    """Lấy lịch sử nhập/xuất kho (phân trang & bộ lọc)"""
    skip = (page - 1) * limit
    return stock_service.get_stock_movements(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        product_id=product_id,
        supplier_id=supplier_id,
        movement_type=movement_type,
    )


@router.post("/import", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
def import_stock(
    payload: StockImportCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Nhập kho: bắt buộc nhà cung cấp, tự động cộng tồn kho"""
    return stock_service.import_stock(db=db, payload=payload, user_id=current_user.id)


@router.post("/export", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
def export_stock(
    payload: StockExportCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Xuất kho: kiểm tra tồn, tự động trừ tồn kho"""
    return stock_service.export_stock(db=db, payload=payload, user_id=current_user.id)
