"""
Authentication routes: signup, login, get current user.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, status

from models.user import UserCreate, UserLogin, UserResponse, TokenResponse
from utils.security import hash_password, verify_password, create_access_token, get_current_user
from database import get_db, is_memory_mode, memory_store

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(user_data: UserCreate):
    """Register a new user account."""
    if is_memory_mode():
        # Check if email already exists
        existing = next((u for u in memory_store["users"] if u["email"] == user_data.email), None)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        user_doc = {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "password_hash": hash_password(user_data.password),
            "created_at": now,
        }
        memory_store["users"].append(user_doc)
    else:
        db = get_db()
        existing = await db.users.find_one({"email": user_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        now = datetime.now(timezone.utc).isoformat()
        result = await db.users.insert_one({
            "name": user_data.name,
            "email": user_data.email,
            "password_hash": hash_password(user_data.password),
            "created_at": now,
        })
        user_id = str(result.inserted_id)

    token = create_access_token(data={"sub": user_id})
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, name=user_data.name, email=user_data.email, created_at=now),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login and receive a JWT token."""
    if is_memory_mode():
        user_doc = next((u for u in memory_store["users"] if u["email"] == credentials.email), None)
        if not user_doc or not verify_password(credentials.password, user_doc["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user_id = user_doc["id"]
        name = user_doc["name"]
        email = user_doc["email"]
        created_at = user_doc["created_at"]
    else:
        db = get_db()
        user_doc = await db.users.find_one({"email": credentials.email})
        if not user_doc or not verify_password(credentials.password, user_doc["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user_id = str(user_doc["_id"])
        name = user_doc["name"]
        email = user_doc["email"]
        created_at = user_doc["created_at"]

    token = create_access_token(data={"sub": user_id})
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, name=name, email=email, created_at=created_at),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"],
    )
