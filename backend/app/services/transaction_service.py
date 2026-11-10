from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.transaction import Transaction
from app.models.wallet import Wallet
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def get_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    wallet_id: int | None = None,
    category_id: int | None = None,
    transaction_type: str | None = None,
) -> list[Transaction]:
    """Lấy danh sách giao dịch thu/chi có phân trang và bộ lọc"""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if wallet_id:
        query = query.filter(Transaction.wallet_id == wallet_id)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)

    return (
        query.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_transaction_by_id(db: Session, transaction_id: int, user_id: int) -> Transaction | None:
    return (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == user_id)
        .first()
    )


def create_transaction(
    db: Session, transaction_in: TransactionCreate, user_id: int
) -> Transaction:
    """Tạo giao dịch và tự động biến động số dư ví"""
    wallet = (
        db.query(Wallet)
        .filter(Wallet.id == transaction_in.wallet_id, Wallet.user_id == user_id)
        .first()
    )
    if not wallet:
        raise NotFoundException("Ví tiền không tồn tại hoặc không thuộc quyền sở hữu của bạn.")

    # Cập nhật số dư ví
    if transaction_in.transaction_type == "EXPENSE":
        wallet.balance -= transaction_in.amount
    elif transaction_in.transaction_type == "INCOME":
        wallet.balance += transaction_in.amount

    db_transaction = Transaction(
        user_id=user_id,
        wallet_id=transaction_in.wallet_id,
        category_id=transaction_in.category_id,
        transaction_type=transaction_in.transaction_type,
        amount=transaction_in.amount,
        description=transaction_in.description,
        transaction_date=transaction_in.transaction_date,
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(
    db: Session, db_transaction: Transaction, transaction_in: TransactionUpdate, user_id: int
) -> Transaction:
    """Cập nhật giao dịch và tính toán lại biến động số dư ví"""
    wallet = (
        db.query(Wallet)
        .filter(Wallet.id == db_transaction.wallet_id, Wallet.user_id == user_id)
        .first()
    )
    if not wallet:
        raise NotFoundException("Không tìm thấy ví liên quan đến giao dịch này.")

    # 1. Hoàn lại số tiền của giao dịch cũ
    if db_transaction.transaction_type == "EXPENSE":
        wallet.balance += db_transaction.amount
    elif db_transaction.transaction_type == "INCOME":
        wallet.balance -= db_transaction.amount

    # 2. Cập nhật dữ liệu mới vào bản ghi transaction
    update_data = transaction_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_transaction, field, value)

    # 3. Áp dụng số tiền của giao dịch mới vào ví (nếu đổi ví thì lấy ví mới)
    target_wallet: Wallet = wallet
    if transaction_in.wallet_id and transaction_in.wallet_id != wallet.id:
        found_wallet = (
            db.query(Wallet)
            .filter(Wallet.id == transaction_in.wallet_id, Wallet.user_id == user_id)
            .first()
        )
        if not found_wallet:
            raise NotFoundException("Ví tiền mới không hợp lệ.")
        target_wallet = found_wallet

    if db_transaction.transaction_type == "EXPENSE":
        target_wallet.balance -= db_transaction.amount
    elif db_transaction.transaction_type == "INCOME":
        target_wallet.balance += db_transaction.amount

    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int, user_id: int) -> None:
    """Xóa giao dịch và phục hồi lại số dư ví gốc"""
    db_transaction = get_transaction_by_id(db, transaction_id=transaction_id, user_id=user_id)
    if not db_transaction:
        raise NotFoundException("Giao dịch không tồn tại.")

    wallet = (
        db.query(Wallet)
        .filter(Wallet.id == db_transaction.wallet_id)
        .first()
    )

    if wallet:
        if db_transaction.transaction_type == "EXPENSE":
            wallet.balance += db_transaction.amount
        elif db_transaction.transaction_type == "INCOME":
            wallet.balance -= db_transaction.amount

    db.delete(db_transaction)
    db.commit()