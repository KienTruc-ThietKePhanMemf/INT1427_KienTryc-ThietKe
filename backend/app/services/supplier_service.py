from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundException
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def get_suppliers_by_user(db: Session, user_id: int) -> list[Supplier]:
    return (
        db.query(Supplier)
        .filter(Supplier.user_id == user_id)
        .order_by(Supplier.id.desc())
        .all()
    )


def get_supplier_by_id(db: Session, supplier_id: int, user_id: int) -> Supplier | None:
    return (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id, Supplier.user_id == user_id)
        .first()
    )


def create_supplier(db: Session, supplier_in: SupplierCreate, user_id: int) -> Supplier:
    db_supplier = Supplier(
        user_id=user_id,
        supplier_name=supplier_in.supplier_name,
        phone=supplier_in.phone,
        email=supplier_in.email,
        address=supplier_in.address,
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


def update_supplier(
    db: Session, supplier_id: int, supplier_in: SupplierUpdate, user_id: int
) -> Supplier:
    db_supplier = get_supplier_by_id(db, supplier_id=supplier_id, user_id=user_id)
    if not db_supplier:
        raise NotFoundException("Không tìm thấy nhà cung cấp.")

    update_data = supplier_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_supplier, field, value)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


def delete_supplier(db: Session, supplier_id: int, user_id: int) -> None:
    db_supplier = get_supplier_by_id(db, supplier_id=supplier_id, user_id=user_id)
    if not db_supplier:
        raise NotFoundException("Không tìm thấy nhà cung cấp.")
    db.delete(db_supplier)
    db.commit()
