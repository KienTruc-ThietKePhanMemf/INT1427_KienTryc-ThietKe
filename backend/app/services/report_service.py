from decimal import Decimal
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.product import ProductResponse
from app.schemas.report import LowStockReport, OverviewReport
from app.schemas.stock_movement import StockMovementResponse


def get_low_stock_products(db: Session, user_id: int) -> LowStockReport:
    items = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(
            Product.user_id == user_id,
            Product.stock_quantity <= Product.min_threshold,
        )
        .order_by(Product.stock_quantity.asc(), Product.id.asc())
        .all()
    )
    return LowStockReport(
        total=len(items),
        items=[ProductResponse.model_validate(item) for item in items],
    )


def get_dashboard_overview(db: Session, user_id: int) -> OverviewReport:
    total_products = (
        db.query(func.count(Product.id)).filter(Product.user_id == user_id).scalar() or 0
    )
    total_stock_quantity = (
        db.query(func.coalesce(func.sum(Product.stock_quantity), 0))
        .filter(Product.user_id == user_id)
        .scalar()
    )
    total_inventory_value = (
        db.query(
            func.coalesce(func.sum(Product.stock_quantity * Product.buy_price), 0)
        )
        .filter(Product.user_id == user_id)
        .scalar()
    )

    recent = (
        db.query(StockMovement)
        .options(
            joinedload(StockMovement.product).joinedload(Product.category),
            joinedload(StockMovement.supplier),
        )
        .filter(StockMovement.user_id == user_id)
        .order_by(StockMovement.created_at.desc(), StockMovement.id.desc())
        .limit(10)
        .all()
    )

    return OverviewReport(
        total_products=int(total_products),
        total_stock_quantity=int(total_stock_quantity or 0),
        total_inventory_value=Decimal(str(total_inventory_value or 0)),
        recent_movements=[StockMovementResponse.model_validate(m) for m in recent],
    )
