from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.report import LowStockReport, OverviewReport, TopProductItem
from app.services import report_service

router = APIRouter()


@router.get("/low-stock", response_model=LowStockReport)
def get_low_stock_report(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Danh sách sản phẩm có tồn kho <= ngưỡng tối thiểu"""
    return report_service.get_low_stock_products(db=db, user_id=current_user.id)


@router.get("/overview", response_model=OverviewReport)
def get_reports_overview(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Dashboard: tổng SP, tổng tồn, giá trị tồn kho, số SP thiếu hàng, phiếu gần đây"""
    return report_service.get_dashboard_overview(db=db, user_id=current_user.id)


@router.get("/top-products", response_model=list[TopProductItem])
def get_top_products_report(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Top 5 SP có lượng xuất/nhập nhiều nhất"""
    return report_service.get_top_products(db=db, user_id=current_user.id, limit=5)
