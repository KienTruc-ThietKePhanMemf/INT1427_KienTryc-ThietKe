from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from fastapi import HTTPException, status

from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetResponse


def get_budgets_by_user(
    db: Session, user_id: int, month: int, year: int
) -> list[BudgetResponse]:
    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        .all()
    )

    result = []
    for b in budgets:
        # Tính tổng chi tiêu thực tế trong tháng/năm của danh mục đó
        query = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "EXPENSE",
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )

        if b.category_id:
            query = query.filter(Transaction.category_id == b.category_id)

        spent = Decimal(str(query.scalar()))
        remaining = b.amount - spent
        percentage = float((spent / b.amount) * 100) if b.amount > 0 else 0.0

        budget_res = BudgetResponse.model_validate(b)
        budget_res.spent_amount = spent
        budget_res.remaining_amount = remaining
        budget_res.percentage_used = round(percentage, 2)
        budget_res.is_warning = percentage >= 80.0
        budget_res.is_exceeded = percentage > 100.0

        result.append(budget_res)

    return result


def create_or_update_budget(
    db: Session, budget_in: BudgetCreate, user_id: int
) -> Budget:
    # Kiểm tra xem đã có ngân sách cho danh mục/tháng/năm này chưa
    existing_budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == user_id,
            Budget.category_id == budget_in.category_id,
            Budget.month == budget_in.month,
            Budget.year == budget_in.year,
        )
        .first()
    )

    if existing_budget:
        existing_budget.amount = budget_in.amount
        db.commit()
        db.refresh(existing_budget)
        return existing_budget

    db_budget = Budget(
        user_id=user_id,
        category_id=budget_in.category_id,
        amount=budget_in.amount,
        month=budget_in.month,
        year=budget_in.year,
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget