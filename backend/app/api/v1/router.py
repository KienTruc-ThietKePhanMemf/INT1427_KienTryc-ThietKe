from fastapi import APIRouter
from app.api.v1 import auth, budgets, categories, reports, transactions, wallets

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(wallets.router, prefix="/wallets", tags=["Wallet Management"])
api_router.include_router(categories.router, prefix="/categories", tags=["Category Management"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transaction Management"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["Budget Management"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Dashboard"])