"""
Authentication routes: signup with email verification, login, OTP verification, profile management.
All data stored directly in MongoDB.
"""
import secrets
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, status

from models.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    PasswordChange,
    UserUpdate,
    VerifyOTPRequest,
    ResendOTPRequest,
    SignupResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GenericAuthResponse,
)
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    validate_password_strength,
)
from database import get_db
from services.email_service import send_verification_otp_email, send_password_reset_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def generate_otp() -> str:
    """Generate a secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000:06d}"


@router.post("/signup", response_model=SignupResponse, status_code=201)
async def signup(user_data: UserCreate):
    """
    Register a new user account directly in MongoDB and dispatch a 6-digit OTP verification email.
    """
    is_valid, err_msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    db = get_db()
    email_clean = user_data.email.strip().lower()
    existing = await db.users.find_one({"email": email_clean})

    now = datetime.now(timezone.utc)
    expires_at = (now + timedelta(minutes=10)).isoformat()
    otp = generate_otp()

    if existing:
        if existing.get("is_verified", False):
            raise HTTPException(status_code=400, detail="Email is already registered. Please log in.")
        
        # User signed up previously but never verified — refresh password and OTP
        await db.users.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "name": user_data.name.strip(),
                    "password_hash": hash_password(user_data.password),
                    "verification_otp": otp,
                    "otp_expires_at": expires_at,
                    "last_otp_sent_at": now.isoformat(),
                }
            },
        )
    else:
        # Create brand new unverified user
        await db.users.insert_one({
            "name": user_data.name.strip(),
            "email": email_clean,
            "password_hash": hash_password(user_data.password),
            "created_at": now.isoformat(),
            "is_verified": False,
            "verification_otp": otp,
            "otp_expires_at": expires_at,
            "last_otp_sent_at": now.isoformat(),
        })

    # Dispatch email asynchronously in background
    await send_verification_otp_email(to_email=email_clean, name=user_data.name, otp=otp)

    return SignupResponse(
        status="verification_required",
        message="A 6-digit verification code has been sent to your email address.",
        email=email_clean,
        is_verified=False,
    )


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: VerifyOTPRequest):
    """
    Verify the 6-digit OTP code and activate the user account.
    """
    db = get_db()
    email_clean = data.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean})

    if not user_doc:
        raise HTTPException(status_code=404, detail="Account not found with this email.")

    if user_doc.get("is_verified", False):
        user_id = str(user_doc["_id"])
        token = create_access_token(data={"sub": user_id})
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user_id,
                name=user_doc["name"],
                email=user_doc["email"],
                created_at=user_doc.get("created_at", ""),
                is_verified=True,
            ),
        )

    saved_otp = user_doc.get("verification_otp")
    otp_expires_at_str = user_doc.get("otp_expires_at")

    if not saved_otp or data.otp.strip() != str(saved_otp).strip():
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check and try again.")

    if otp_expires_at_str:
        try:
            expires_at = datetime.fromisoformat(otp_expires_at_str)
            if datetime.now(timezone.utc) > expires_at:
                raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
        except ValueError:
            pass

    # Mark as verified and clear OTP fields
    await db.users.update_one(
        {"_id": user_doc["_id"]},
        {
            "$set": {"is_verified": True},
            "$unset": {"verification_otp": "", "otp_expires_at": ""},
        },
    )

    user_id = str(user_doc["_id"])
    token = create_access_token(data={"sub": user_id})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user_doc["name"],
            email=user_doc["email"],
            created_at=user_doc.get("created_at", datetime.now(timezone.utc).isoformat()),
            is_verified=True,
        ),
    )


@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest):
    """
    Resend a fresh 6-digit OTP verification code to the user's email.
    """
    db = get_db()
    email_clean = data.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean})

    if not user_doc:
        raise HTTPException(status_code=404, detail="Account not found with this email.")

    if user_doc.get("is_verified", False):
        raise HTTPException(status_code=400, detail="This account is already verified. Please log in.")

    now = datetime.now(timezone.utc)
    
    # Cooldown check: minimum 30 seconds between resends
    last_sent_str = user_doc.get("last_otp_sent_at")
    if last_sent_str:
        try:
            last_sent = datetime.fromisoformat(last_sent_str)
            if (now - last_sent).total_seconds() < 30:
                remaining = int(30 - (now - last_sent).total_seconds())
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {remaining} seconds before requesting another code.",
                )
        except (ValueError, TypeError):
            pass

    otp = generate_otp()
    expires_at = (now + timedelta(minutes=10)).isoformat()

    await db.users.update_one(
        {"_id": user_doc["_id"]},
        {
            "$set": {
                "verification_otp": otp,
                "otp_expires_at": expires_at,
                "last_otp_sent_at": now.isoformat(),
            }
        },
    )

    await send_verification_otp_email(to_email=email_clean, name=user_doc.get("name", "Researcher"), otp=otp)
    return {"message": "A new 6-digit verification code has been sent to your email."}


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login and verify credentials against MongoDB."""
    db = get_db()
    email_clean = credentials.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean})
    
    if not user_doc or not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check email verification status
    if not user_doc.get("is_verified", False):
        # Trigger an OTP email automatically if expired or missing
        now = datetime.now(timezone.utc)
        otp = generate_otp()
        expires_at = (now + timedelta(minutes=10)).isoformat()
        await db.users.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "verification_otp": otp,
                    "otp_expires_at": expires_at,
                    "last_otp_sent_at": now.isoformat(),
                }
            },
        )
        await send_verification_otp_email(to_email=email_clean, name=user_doc.get("name", "Researcher"), otp=otp)
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Your email is not verified yet. We have sent a new verification code to your email.",
                "email": email_clean,
                "is_verified": False,
            },
        )

    user_id = str(user_doc["_id"])
    name = user_doc["name"]
    email = user_doc["email"]
    created_at = user_doc.get("created_at", "")

    token = create_access_token(data={"sub": user_id})
    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, name=name, email=email, created_at=created_at, is_verified=True),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"],
        is_verified=True,
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update current user's profile directly in MongoDB."""
    new_name = (update_data.name or "").strip()
    if not new_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    db = get_db()
    query = {"_id": ObjectId(current_user["id"])} if ObjectId.is_valid(current_user["id"]) else {"_id": current_user["id"]}
    await db.users.update_one(query, {"$set": {"name": new_name}})

    return UserResponse(
        id=current_user["id"],
        name=new_name,
        email=current_user["email"],
        created_at=current_user["created_at"],
        is_verified=True,
    )


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    current_user: dict = Depends(get_current_user),
):
    """Change current user password in MongoDB."""
    is_valid, err_msg = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    db = get_db()
    query = {"_id": ObjectId(current_user["id"])} if ObjectId.is_valid(current_user["id"]) else {"_id": current_user["id"]}
    user_doc = await db.users.find_one(query)
    if not user_doc or not verify_password(data.current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    await db.users.update_one(query, {"$set": {"password_hash": hash_password(data.new_password)}})
    return {"message": "Password updated successfully"}


@router.post("/forgot-password", response_model=GenericAuthResponse)
async def forgot_password(data: ForgotPasswordRequest):
    """
    Initiate password reset flow: generate a 6-digit OTP and send to user's registered email.
    """
    db = get_db()
    email_clean = data.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean})

    if not user_doc:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email address."
        )

    now = datetime.now(timezone.utc)
    last_sent_str = user_doc.get("reset_otp_last_sent_at")
    if last_sent_str:
        try:
            last_sent = datetime.fromisoformat(last_sent_str)
            if (now - last_sent).total_seconds() < 30:
                raise HTTPException(
                    status_code=429,
                    detail="Please wait 30 seconds before requesting another password reset code."
                )
        except ValueError:
            pass

    otp = generate_otp()
    expires_at = (now + timedelta(minutes=10)).isoformat()

    await db.users.update_one(
        {"_id": user_doc["_id"]},
        {
            "$set": {
                "reset_password_otp": otp,
                "reset_password_expires_at": expires_at,
                "reset_otp_last_sent_at": now.isoformat(),
            }
        },
    )

    user_name = user_doc.get("name", "Researcher")
    await send_password_reset_otp_email(to_email=email_clean, name=user_name, otp=otp)

    return GenericAuthResponse(
        status="otp_sent",
        message="A 6-digit password reset code has been sent to your email.",
    )


@router.post("/reset-password", response_model=GenericAuthResponse)
async def reset_password(data: ResetPasswordRequest):
    """
    Verify 6-digit OTP and reset user password in MongoDB.
    """
    is_valid, err_msg = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    db = get_db()
    email_clean = data.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_clean})

    if not user_doc:
        raise HTTPException(status_code=404, detail="Account not found with this email address.")

    saved_otp = user_doc.get("reset_password_otp")
    expires_at_str = user_doc.get("reset_password_expires_at")

    if not saved_otp or data.otp.strip() != str(saved_otp).strip():
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check and try again.")

    if expires_at_str:
        try:
            expires_at = datetime.fromisoformat(expires_at_str)
            if datetime.now(timezone.utc) > expires_at:
                raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
        except ValueError:
            pass

    # Update password and clear reset OTP fields
    await db.users.update_one(
        {"_id": user_doc["_id"]},
        {
            "$set": {
                "password_hash": hash_password(data.new_password),
                "is_verified": True,
            },
            "$unset": {
                "reset_password_otp": "",
                "reset_password_expires_at": "",
                "reset_otp_last_sent_at": "",
            },
        },
    )

    return GenericAuthResponse(
        status="success",
        message="Password successfully reset! You can now sign in with your new password.",
    )





