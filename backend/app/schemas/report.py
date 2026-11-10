from decimal import Decimal
from pydantic import BaseModel
from app.schemas.product import ProductResponse
from app.schemas.stock_movement import StockMovementResponse


class OverviewReport(BaseModel):
    total_products: int
    total_stock_quantity: int
    total_inventory_value: Decimal
    low_stock_count: int = 0
    recent_movements: list[StockMovementResponse] = []


class LowStockReport(BaseModel):
    total: int
    items: list[ProductResponse]


class TopProductItem(BaseModel):
    product_id: int
    product_name: str
    sku: str
    total_imported: int
    total_exported: int
    total_movement: int
