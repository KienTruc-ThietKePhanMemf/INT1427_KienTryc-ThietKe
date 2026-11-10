from fastapi import APIRouter
from app.api.v1 import auth, categories, products, reports, stock_movements, suppliers

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(categories.router, prefix="/categories", tags=["Category Management"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Supplier Management"])
api_router.include_router(products.router, prefix="/products", tags=["Product Management"])
api_router.include_router(
    stock_movements.router, prefix="/stock-movements", tags=["Stock Movements"]
)
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Alerts"])
