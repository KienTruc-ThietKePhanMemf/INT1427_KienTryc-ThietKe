from fastapi import status


# Base Custom Exception cho toàn bộ ứng dụng
class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = "BAD_REQUEST",
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)


# Các Custom Exceptions cụ thể
class NotFoundException(AppException):
    def __init__(self, message: str = "Tài nguyên không tồn tại"):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Xác thực không hợp lệ"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="UNAUTHORIZED",
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Bạn không có quyền thực hiện thao tác này"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="FORBIDDEN",
        )


class BadRequestException(AppException):
    def __init__(self, message: str = "Yêu cầu không hợp lệ"):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="BAD_REQUEST",
        )