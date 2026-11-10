from decimal import Decimal
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.product import ProductResponse
from app.schemas.report import LowStockReport, OverviewReport, TopProductItem
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

    low_stock_count = (
        db.query(func.count(Product.id))
        .filter(
            Product.user_id == user_id,
            Product.stock_quantity <= Product.min_threshold,
        )
        .scalar()
        or 0
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
        low_stock_count=int(low_stock_count),
        recent_movements=[StockMovementResponse.model_validate(m) for m in recent],
    )


def get_top_products(db: Session, user_id: int, limit: int = 5) -> list[TopProductItem]:
    """Top 5 SP có tổng lượng xuất / nhập nhiều nhất"""
    products = (
        db.query(Product)
        .filter(Product.user_id == user_id)
        .all()
    )

    result: list[TopProductItem] = []
    for p in products:
        total_import = (
            db.query(func.coalesce(func.sum(StockMovement.quantity), 0))
            .filter(
                StockMovement.user_id == user_id,
                StockMovement.product_id == p.id,
                StockMovement.movement_type == "IMPORT",
            )
            .scalar()
            or 0
        )
        total_export = (
            db.query(func.coalesce(func.sum(StockMovement.quantity), 0))
            .filter(
                StockMovement.user_id == user_id,
                StockMovement.product_id == p.id,
                StockMovement.movement_type == "EXPORT",
            )
            .scalar()
            or 0
        )
        total_movement = total_import + total_export
        result.append(
            TopProductItem(
                product_id=p.id,
                product_name=p.product_name,
                sku=p.sku,
                total_imported=int(total_import),
                total_exported=int(total_export),
                total_movement=int(total_movement),
            )
        )

    # Sort descending by total movement
    result.sort(key=lambda x: x.total_movement, reverse=True)
    return result[:limit]
