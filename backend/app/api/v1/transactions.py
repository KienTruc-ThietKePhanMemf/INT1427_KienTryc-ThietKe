from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionUpdate
from app.services import transaction_service

router = APIRouter()


@router.get("/", response_model=list[TransactionResponse])
def get_user_transactions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    wallet_id: int | None = None,
    category_id: int | None = None,
    transaction_type: str | None = None,
):
    """Lấy danh sách giao dịch thu/chi (Có phân trang & bộ lọc)"""
    skip = (page - 1) * limit
    return transaction_service.get_transactions(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        wallet_id=wallet_id,
        category_id=category_id,
        transaction_type=transaction_type,
    )


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_in: TransactionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Tạo giao dịch thu/chi mới (Tự động cộng/trừ số dư ví)"""
    return transaction_service.create_transaction(
        db=db, transaction_in=transaction_in, user_id=current_user.id
    )


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Sửa giao dịch (Tự động tính lại biến động số dư ví)"""
    db_transaction = transaction_service.get_transaction_by_id(
        db, transaction_id=transaction_id, user_id=current_user.id
    )
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy giao dịch."
        )

    return transaction_service.update_transaction(
        db=db,
        db_transaction=db_transaction,
        transaction_in=transaction_in,
        user_id=current_user.id,
    )


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Xóa giao dịch (Tự động hoàn tiền về ví)"""
    transaction_service.delete_transaction(
        db=db, transaction_id=transaction_id, user_id=current_user.id
    )
    return None
