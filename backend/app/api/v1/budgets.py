from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.services import budget_service

router = APIRouter()


@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    current_user: Annotated[User, Depends(get_current_user)],
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2024),
    db: Session = Depends(get_db),
):
    """Lấy danh sách ngân sách tháng và tiến độ chi tiêu thực tế"""
    return budget_service.get_budgets_by_user(
        db=db, user_id=current_user.id, month=month, year=year
    )


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def set_budget(
    budget_in: BudgetCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Thiết lập hoặc cập nhật hạn mức ngân sách tháng"""
    budget = budget_service.create_or_update_budget(
        db=db, budget_in=budget_in, user_id=current_user.id
    )
    # Re-fetch để tính toán spent_amount & progress
    res = budget_service.get_budgets_by_user(
        db=db, user_id=current_user.id, month=budget.month, year=budget.year
    )
    return [b for b in res if b.id == budget.id][0]