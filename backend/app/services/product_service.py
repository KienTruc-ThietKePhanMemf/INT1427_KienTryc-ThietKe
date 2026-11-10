from sqlalchemy.orm import Session, joinedload
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.category_service import get_category_by_id


def get_products(
    db: Session,
    user_id: int,
    category_id: int | None = None,
    low_stock: bool = False,
) -> list[Product]:
    query = (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.user_id == user_id)
    )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if low_stock:
        query = query.filter(Product.stock_quantity <= Product.min_threshold)
    return query.order_by(Product.id.desc()).all()


def get_product_by_id(db: Session, product_id: int, user_id: int) -> Product | None:
    return (
        db.query(Product)
        .options(joinedload(Product.category))
        .filter(Product.id == product_id, Product.user_id == user_id)
        .first()
    )


def _ensure_unique_sku(
    db: Session, sku: str, user_id: int, exclude_product_id: int | None = None
) -> None:
    query = db.query(Product).filter(Product.sku == sku)
    if exclude_product_id:
        query = query.filter(Product.id != exclude_product_id)
    if query.first():
        raise BadRequestException(f"SKU '{sku}' đã tồn tại.")


def create_product(db: Session, product_in: ProductCreate, user_id: int) -> Product:
    category = get_category_by_id(db, category_id=product_in.category_id, user_id=user_id)
    if not category:
        raise NotFoundException("Danh mục không tồn tại hoặc không thuộc quyền của bạn.")

    _ensure_unique_sku(db, sku=product_in.sku, user_id=user_id)

    db_product = Product(
        user_id=user_id,
        category_id=product_in.category_id,
        sku=product_in.sku,
        product_name=product_in.product_name,
        unit=product_in.unit,
        buy_price=product_in.buy_price,
        sell_price=product_in.sell_price,
        stock_quantity=0,
        min_threshold=product_in.min_threshold,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return get_product_by_id(db, product_id=db_product.id, user_id=user_id)


def update_product(
    db: Session, product_id: int, product_in: ProductUpdate, user_id: int
) -> Product:
    db_product = get_product_by_id(db, product_id=product_id, user_id=user_id)
    if not db_product:
        raise NotFoundException("Không tìm thấy sản phẩm.")

    update_data = product_in.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        category = get_category_by_id(
            db, category_id=update_data["category_id"], user_id=user_id
        )
        if not category:
            raise NotFoundException("Danh mục không tồn tại hoặc không thuộc quyền của bạn.")

    if "sku" in update_data:
        _ensure_unique_sku(
            db, sku=update_data["sku"], user_id=user_id, exclude_product_id=product_id
        )

    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return get_product_by_id(db, product_id=db_product.id, user_id=user_id)


def delete_product(db: Session, product_id: int, user_id: int) -> None:
    db_product = get_product_by_id(db, product_id=product_id, user_id=user_id)
    if not db_product:
        raise NotFoundException("Không tìm thấy sản phẩm.")
    db.delete(db_product)
    db.commit()
