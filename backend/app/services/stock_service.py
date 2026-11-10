from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.models.supplier import Supplier
from app.schemas.stock_movement import StockExportCreate, StockImportCreate


def _load_movement_query(db: Session):
    return db.query(StockMovement).options(
        joinedload(StockMovement.product).joinedload(Product.category),
        joinedload(StockMovement.supplier),
    )


def get_stock_movements(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    product_id: int | None = None,
    supplier_id: int | None = None,
    movement_type: str | None = None,
) -> list[StockMovement]:
    query = _load_movement_query(db).filter(StockMovement.user_id == user_id)

    if product_id:
        query = query.filter(StockMovement.product_id == product_id)
    if supplier_id:
        query = query.filter(StockMovement.supplier_id == supplier_id)
    if movement_type:
        query = query.filter(StockMovement.movement_type == movement_type)

    return (
        query.order_by(StockMovement.created_at.desc(), StockMovement.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def _get_owned_product_for_update(db: Session, product_id: int, user_id: int) -> Product:
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not product:
        raise NotFoundException("Sản phẩm không tồn tại hoặc không thuộc quyền sở hữu của bạn.")
    return product


def _get_owned_supplier(db: Session, supplier_id: int, user_id: int) -> Supplier:
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id, Supplier.user_id == user_id)
        .first()
    )
    if not supplier:
        raise NotFoundException("Nhà cung cấp không tồn tại hoặc không thuộc quyền sở hữu của bạn.")
    return supplier


def import_stock(db: Session, payload: StockImportCreate, user_id: int) -> StockMovement:
    """Nhập kho: khóa dòng sản phẩm, cộng tồn, ghi phiếu IMPORT (ACID)."""
    try:
        product = _get_owned_product_for_update(
            db, product_id=payload.product_id, user_id=user_id
        )
        _get_owned_supplier(db, supplier_id=payload.supplier_id, user_id=user_id)

        product.stock_quantity += payload.quantity

        movement = StockMovement(
            user_id=user_id,
            product_id=payload.product_id,
            supplier_id=payload.supplier_id,
            movement_type="IMPORT",
            quantity=payload.quantity,
            note=payload.note,
        )
        db.add(movement)
        db.commit()
        db.refresh(movement)
    except Exception:
        db.rollback()
        raise

    return (
        _load_movement_query(db)
        .filter(StockMovement.id == movement.id, StockMovement.user_id == user_id)
        .first()
    )


def export_stock(db: Session, payload: StockExportCreate, user_id: int) -> StockMovement:
    """Xuất kho: khóa dòng sản phẩm, kiểm tra tồn, trừ tồn, ghi phiếu EXPORT (ACID)."""
    try:
        product = _get_owned_product_for_update(
            db, product_id=payload.product_id, user_id=user_id
        )

        if product.stock_quantity < payload.quantity:
            raise BadRequestException("Số lượng hàng trong kho không đủ để xuất!")

        product.stock_quantity -= payload.quantity

        movement = StockMovement(
            user_id=user_id,
            product_id=payload.product_id,
            supplier_id=None,
            movement_type="EXPORT",
            quantity=payload.quantity,
            note=payload.note,
        )
        db.add(movement)
        db.commit()
        db.refresh(movement)
    except Exception:
        db.rollback()
        raise

    return (
        _load_movement_query(db)
        .filter(StockMovement.id == movement.id, StockMovement.user_id == user_id)
        .first()
    )
