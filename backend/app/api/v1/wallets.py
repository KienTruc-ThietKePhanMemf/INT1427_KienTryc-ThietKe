from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.wallet import WalletCreate, WalletResponse, WalletUpdate
from app.services import wallet_service

router = APIRouter()


@router.get("/", response_model=list[WalletResponse])
def get_user_wallets(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Lấy danh sách tất cả ví tiền của người dùng đang đăng nhập"""
    return wallet_service.get_wallets_by_user(db=db, user_id=current_user.id)


@router.post("/", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
def create_new_wallet(
    wallet_in: WalletCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Tạo ví tiền mới (Ví tiền mặt, Ngân hàng, Ví điện tử)"""
    return wallet_service.create_wallet(
        db=db, wallet_in=wallet_in, user_id=current_user.id
    )


@router.get("/{wallet_id}", response_model=WalletResponse)
def get_wallet_detail(
    wallet_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Lấy thông tin chi tiết của 1 ví"""
    wallet = wallet_service.get_wallet_by_id(
        db=db, wallet_id=wallet_id, user_id=current_user.id
    )
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy ví tiền hoặc bạn không có quyền truy cập.",
        )
    return wallet


@router.put("/{wallet_id}", response_model=WalletResponse)
def update_existing_wallet(
    wallet_id: int,
    wallet_in: WalletUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin ví (Tên ví, Loại ví)"""
    wallet = wallet_service.get_wallet_by_id(
        db=db, wallet_id=wallet_id, user_id=current_user.id
    )
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy ví tiền hoặc bạn không có quyền truy cập.",
        )
    return wallet_service.update_wallet(db=db, db_wallet=wallet, wallet_in=wallet_in)


@router.delete("/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_wallet(
    wallet_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Xóa ví tiền"""
    wallet = wallet_service.get_wallet_by_id(
        db=db, wallet_id=wallet_id, user_id=current_user.id
    )
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy ví tiền hoặc bạn không có quyền truy cập.",
        )
    wallet_service.delete_wallet(db=db, db_wallet=wallet)
    return None