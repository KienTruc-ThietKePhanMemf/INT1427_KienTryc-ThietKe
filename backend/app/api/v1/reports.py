from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services import report_service

router = APIRouter()


@router.get("/overview")
def get_reports_overview(
    current_user: Annotated[User, Depends(get_current_user)],
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2024),
    db: Session = Depends(get_db),
):
    """Lấy dữ liệu tổng quan tài chính & biểu đồ phân tích chi tiêu"""
    return report_service.get_dashboard_overview(
        db=db, user_id=current_user.id, month=month, year=year
    )