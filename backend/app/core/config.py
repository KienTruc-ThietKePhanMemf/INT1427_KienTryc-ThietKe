import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Mini Inventory Management System")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///D:/INT1427_KienTryc-ThietKe/backend/app.db",
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "loc_super_secret_key_jwt_2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )


settings = Settings()