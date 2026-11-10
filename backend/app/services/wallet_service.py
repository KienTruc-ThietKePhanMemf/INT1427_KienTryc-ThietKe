from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.wallet import Wallet
from app.schemas.wallet import WalletCreate, WalletUpdate


def get_wallets_by_user(db: Session, user_id: int) -> list[Wallet]:
    return db.query(Wallet).filter(Wallet.user_id == user_id).all()


def get_wallet_by_id(db: Session, wallet_id: int, user_id: int) -> Wallet | None:
    return (
        db.query(Wallet)
        .filter(Wallet.id == wallet_id, Wallet.user_id == user_id)
        .first()
    )


def create_wallet(db: Session, wallet_in: WalletCreate, user_id: int) -> Wallet:
    db_wallet = Wallet(
        user_id=user_id,
        wallet_name=wallet_in.wallet_name,
        wallet_type=wallet_in.wallet_type,
        balance=wallet_in.initial_balance,
    )
    db.add(db_wallet)
    db.commit()
    db.refresh(db_wallet)
    return db_wallet


def update_wallet(
    db: Session, db_wallet: Wallet, wallet_in: WalletUpdate
) -> Wallet:
    update_data = wallet_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_wallet, field, value)
    db.commit()
    db.refresh(db_wallet)
    return db_wallet


def delete_wallet(db: Session, db_wallet: Wallet) -> None:
    db.delete(db_wallet)
    db.commit()