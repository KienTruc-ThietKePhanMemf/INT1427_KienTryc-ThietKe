from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import AppException
from app.core.handlers import (
    app_exception_handler,
    global_exception_handler,
    validation_exception_handler,
)

import app.models  # Load models
# Tự động tạo bảng trong MySQL nếu chưa có
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API cho hệ thống quản lý chi tiêu sinh viên",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === ĐĂNG KÝ GLOBAL EXCEPTION HANDLERS ===
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Gắn toàn bộ router v1 vào endpoint có tiền tố /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API!",
        "status": "online",
    }
