from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories_by_user(db: Session, user_id: int) -> list[Category]:
    """Lấy danh mục hệ thống (user_id IS NULL) + Danh mục cá nhân của User"""
    return (
        db.query(Category)
        .filter((Category.user_id == None) | (Category.user_id == user_id))
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


def create_category(
    db: Session, category_in: CategoryCreate, user_id: int
) -> Category:
    db_category = Category(
        user_id=user_id,
        category_name=category_in.category_name,
        category_type=category_in.category_type,
        icon=category_in.icon,
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
    """Khởi tạo bộ danh mục mặc định nếu chưa có trong DB"""
    default_categories = [
        # Chi tiêu (EXPENSE)
        {"category_name": "Ăn uống", "category_type": "EXPENSE", "icon": "utensils"},
        {"category_name": "Đi lại", "category_type": "EXPENSE", "icon": "car"},
        {"category_name": "Học tập", "category_type": "EXPENSE", "icon": "book"},
        {"category_name": "Nhà ở & Điện nước", "category_type": "EXPENSE", "icon": "home"},
        {"category_name": "Mua sắm", "category_type": "EXPENSE", "icon": "shopping-bag"},
        {"category_name": "Giải trí", "category_type": "EXPENSE", "icon": "gamepad"},
        {"category_name": "Sức khỏe", "category_type": "EXPENSE", "icon": "heartbeat"},
        {"category_name": "Khác", "category_type": "EXPENSE", "icon": "ellipsis-h"},
        # Thu nhập (INCOME)
        {"category_name": "Tiền gia đình chu cấp", "category_type": "INCOME", "icon": "hand-holding-usd"},
        {"category_name": "Lương làm thêm", "category_type": "INCOME", "icon": "briefcase"},
        {"category_name": "Học bổng", "category_type": "INCOME", "icon": "graduation-cap"},
        {"category_name": "Thưởng & Trợ cấp", "category_type": "INCOME", "icon": "gift"},
        {"category_name": "Thu nhập khác", "category_type": "INCOME", "icon": "wallet"},
    ]

    for item in default_categories:
        exists = (
            db.query(Category)
            .filter(
                Category.user_id == None,
                Category.category_name == item["category_name"],
            )
            .first()
        )
        if not exists:
            db.add(Category(user_id=None, **item))
    db.commit()