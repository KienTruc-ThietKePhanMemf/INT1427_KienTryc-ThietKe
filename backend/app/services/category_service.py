from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

DEFAULT_CATEGORIES = [
    "Linh kiện điện tử",
    "Đồ gia dụng",
    "Bao bì & Đóng gói",
    "Văn phòng phẩm",
    "Khác",
]


def get_categories_by_user(db: Session, user_id: int) -> list[Category]:
    """Lấy danh mục hệ thống (user_id IS NULL) + danh mục cá nhân của User"""
    return (
        db.query(Category)
        .filter((Category.user_id == None) | (Category.user_id == user_id))
        .order_by(Category.id.asc())
        .all()
    )


def get_category_by_id(db: Session, category_id: int, user_id: int) -> Category | None:
    return (
        db.query(Category)
        .filter(
            Category.id == category_id,
            (Category.user_id == None) | (Category.user_id == user_id),
        )
        .first()
    )


def create_category(db: Session, category_in: CategoryCreate, user_id: int) -> Category:
    db_category = Category(
        user_id=user_id,
        category_name=category_in.category_name,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(
    db: Session, db_category: Category, category_in: CategoryUpdate
) -> Category:
    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, db_category: Category) -> None:
    db.delete(db_category)
    db.commit()


def seed_default_categories(db: Session) -> None:
    """Khởi tạo danh mục kho mặc định (user_id IS NULL) nếu chưa có"""
    for name in DEFAULT_CATEGORIES:
        exists = (
            db.query(Category)
            .filter(Category.user_id == None, Category.category_name == name)
            .first()
        )
        if not exists:
            db.add(Category(user_id=None, category_name=name))
    db.commit()
