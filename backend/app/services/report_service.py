from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import extract, func

from app.models.category import Category
from app.models.transaction import Transaction
from app.models.wallet import Wallet


def get_dashboard_overview(db: Session, user_id: int, month: int, year: int) -> dict:
    # 1. Tính tổng thu nhập tháng
    total_income = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "INCOME",
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )
        .scalar()
    )

    # 2. Tính tổng chi tiêu tháng
    total_expense = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "EXPENSE",
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )
        .scalar()
    )

    # 3. Tính tổng số dư hiện tại của tất cả các ví
    total_balance = (
        db.query(func.coalesce(func.sum(Wallet.balance), 0))
        .filter(Wallet.user_id == user_id)
        .scalar()
    )

    # 4. Tìm danh mục chi tiêu nhiều nhất trong tháng
    top_category_query = (
        db.query(
            Category.category_name,
            func.sum(Transaction.amount).label("total_amount"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "EXPENSE",
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )
        .group_by(Category.id, Category.category_name)
        .order_by(func.sum(Transaction.amount).desc())
        .first()
    )

    top_category = None
    if top_category_query:
        top_category = {
            "category_name": top_category_query[0],
            "total_amount": top_category_query[1],
        }

    # 5. Thống kê chi tiêu theo từng danh mục (Phục vụ vẽ biểu đồ Tròn/Cột)
    category_breakdown = (
        db.query(
            Category.category_name,
            func.sum(Transaction.amount).label("total_amount"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == "EXPENSE",
            extract("month", Transaction.transaction_date) == month,
            extract("year", Transaction.transaction_date) == year,
        )
        .group_by(Category.id, Category.category_name)
        .all()
    )

    breakdown_list = [
        {"category_name": item[0], "total_amount": item[1]}
        for item in category_breakdown
    ]

    return {
        "month": month,
        "year": year,
        "total_income": Decimal(str(total_income)),
        "total_expense": Decimal(str(total_expense)),
        "net_savings": Decimal(str(total_income)) - Decimal(str(total_expense)),
        "total_balance": Decimal(str(total_balance)),
        "top_expense_category": top_category,
        "category_breakdown": breakdown_list,
    }