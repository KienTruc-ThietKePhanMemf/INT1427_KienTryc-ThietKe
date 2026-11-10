from decimal import Decimal
from pydantic import BaseModel
from app.schemas.product import ProductResponse
from app.schemas.stock_movement import StockMovementResponse


class OverviewReport(BaseModel):
    total_products: int
    total_stock_quantity: int
    total_inventory_value: Decimal
    recent_movements: list[StockMovementResponse]


class LowStockReport(BaseModel):
    total: int
    items: list[ProductResponse]
