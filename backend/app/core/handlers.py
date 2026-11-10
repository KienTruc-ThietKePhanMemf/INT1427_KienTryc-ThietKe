from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.exceptions import AppException


# 1. Custom App Exception Handler
async def app_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error_code": exc.error_code,
                "message": exc.message,
            },
        )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error_code": "BAD_REQUEST",
            "message": str(exc),
        },
    )


# 2. Validation Error Handler (Sửa exc: Exception để hết lỗi Pylance)
async def validation_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, RequestValidationError):
        errors = exc.errors()
        first_error = errors[0] if errors else {}
        msg = first_error.get("msg", "Dữ liệu đầu vào không hợp lệ")
        field = " -> ".join([str(x)
                            for x in first_error.get("loc", []) if x != "body"])

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error_code": "VALIDATION_ERROR",
                "message": f"Lỗi trường '{field}': {msg}" if field else msg,
                "details": errors,
            },
        )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error_code": "VALIDATION_ERROR",
            "message": "Dữ liệu đầu vào không hợp lệ",
        },
    )


# 3. Global Server Exception Handler
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau!",
        },
    )
