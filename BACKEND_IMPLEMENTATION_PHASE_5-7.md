# Backend Implementation: Google OAuth Migration
## Phases 5-7 (Refactor, OAuth, Phone Verification)

This document contains all backend code needed for the Google OAuth migration. Copy these files into your `Backend/` repository.

---

## File Structure

```
Backend/
├── routers/
│   ├── auth_legacy/
│   │   ├── __init__.py           (empty)
│   │   ├── model.py              (schemas)
│   │   ├── service.py            (business logic)
│   │   └── controller.py          (routes)
│   ├── image.py                   (update imports)
│   ├── events/
│   │   ├── controller.py          (update imports)
│   │   └── service.py             (update imports)
│   ├── event_config/
│   │   └── controller.py          (update imports)
│   ├── user_routes.py             (update phone handling)
│   ├── shopCreds.py               (update imports)
│   └── agenda/
│       └── controller.py          (update imports)
├── utils/
│   └── otp_utils.py               (unchanged - reusable)
├── Shared/
│   └── models/
│       └── zapigo_api_models.py   (update Users model)
├── main.py                         (update imports)
└── .env                           (add GOOGLE_CLIENT_IDS)
```

---

## Phase 5: Refactor auth_legacy.py

### 1. Create `routers/auth_legacy/__init__.py`

```python
# Empty file to mark as package
```

### 2. Create `routers/auth_legacy/model.py`

```python
from pydantic import BaseModel, EmailStr
from typing import Optional

# Request Models
class GoogleLoginRequest(BaseModel):
    id_token: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class SendPhoneOTPRequest(BaseModel):
    phone_number: str

class VerifyPhoneRequest(BaseModel):
    phone_number: str
    otp: str

class MergeAccountRequest(BaseModel):
    phone_number: str
    otp: str

# Response Models
class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone_number: Optional[str] = None

class GoogleLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    is_new_user: bool
    user: UserResponse

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SendOTPResponse(BaseModel):
    message: str

class VerifyPhoneResponse(BaseModel):
    message: str
    phone_number: str

class MergeAccountResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
```

### 3. Create `routers/auth_legacy/service.py`

```python
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlalchemy.orm import Session
from Shared.models.zapigo_api_models import User

# Config from environment
JWT_AUTH_SECRET_KEY = os.getenv("JWT_AUTH_SECRET_KEY", "your-secret-key")
JWT_AUTH_ALGO = os.getenv("JWT_AUTH_ALGO", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "15"))
GOOGLE_CLIENT_IDS = os.getenv("GOOGLE_CLIENT_IDS", "").split(",")

security = HTTPBearer()

# ============================================================================
# JWT Token Management
# ============================================================================

def create_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT token with optional expiration."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_AUTH_SECRET_KEY, algorithm=JWT_AUTH_ALGO)
    return encoded_jwt

def create_token_pair(user_id: str) -> tuple[str, str]:
    """Create access and refresh token pair."""
    access_token = create_token(
        {"sub": user_id},
        timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = create_token(
        {"sub": user_id, "type": "refresh"},
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return access_token, refresh_token

def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, JWT_AUTH_SECRET_KEY, algorithms=[JWT_AUTH_ALGO])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ============================================================================
# Google OAuth Token Verification
# ============================================================================

def verify_google_id_token(id_token_str: str) -> Dict[str, Any]:
    """
    Verify Google ID token signature and return decoded claims.
    
    Raises:
        ValueError: If token is invalid or signature verification fails
    """
    try:
        # Verify token signature against Google's public keys
        idinfo = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            audience=GOOGLE_CLIENT_IDS
        )
        
        # Check if email is verified
        if not idinfo.get("email_verified", False):
            raise ValueError("Email not verified by Google")
        
        return idinfo
    except ValueError as e:
        raise ValueError(f"Invalid ID token: {str(e)}")
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")

# ============================================================================
# User Lookup & Creation
# ============================================================================

def get_user_by_google_sub(db: Session, google_sub: str) -> Optional[User]:
    """Find user by google_sub (returning user)."""
    return db.query(User).filter(User.google_sub == google_sub).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Find user by email (for account linking)."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_phone(db: Session, phone_number: str) -> Optional[User]:
    """Find user by phone number."""
    return db.query(User).filter(User.phone_number == phone_number).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Find user by ID."""
    return db.query(User).filter(User.id == user_id).first()

# ============================================================================
# Auth Flows
# ============================================================================

def login_with_google(id_token_str: str, db: Session) -> tuple[User, str, str, bool]:
    """
    Authenticate user with Google ID token.
    
    Returns:
        (user, access_token, refresh_token, is_new_user)
    """
    try:
        # Verify token signature
        idinfo = verify_google_id_token(id_token_str)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    google_sub = idinfo.get("sub")
    email = idinfo.get("email")
    name = idinfo.get("name", "User")
    picture = idinfo.get("picture")
    
    if not google_sub or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required claims in token"
        )
    
    # Step 1: Check if user exists by google_sub (returning user)
    user = get_user_by_google_sub(db, google_sub)
    is_new_user = False
    
    if user:
        # Returning user
        return user, *create_token_pair(user.id), is_new_user
    
    # Step 2: Check if email matches existing user (account linking)
    user = get_user_by_email(db, email)
    
    if user:
        # Link Google account to existing user
        user.google_sub = google_sub
        if user.name == "User" or not user.name:  # Update name if generic
            user.name = name
        db.commit()
        return user, *create_token_pair(user.id), False
    
    # Step 3: Create new user
    is_new_user = True
    new_user = User(
        email=email,
        name=name,
        google_sub=google_sub,
        phone_number=None,  # Phone is optional for Google users
        picture=picture,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user, *create_token_pair(new_user.id), is_new_user

# ============================================================================
# FastAPI Dependencies
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Extract and verify current user from bearer token."""
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure user is active (not deleted/blocked)."""
    from Shared.models.zapigo_api_models import UserStatus
    
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    
    return current_user

# ============================================================================
# Phone Verification Helpers
# ============================================================================

def send_phone_otp(phone_number: str, db: Session) -> None:
    """
    Send OTP to phone number.
    
    Checks if phone is:
    - Linked to an active Google account → 409 Conflict
    - Linked to orphaned OTP account → Allow
    - Unregistered → Allow
    """
    from utils.otp_utils import send_otp
    from Shared.models.zapigo_api_models import UserStatus
    
    user = get_user_by_phone(db, phone_number)
    
    if user and user.google_sub and user.status == UserStatus.ACTIVE:
        # Phone belongs to active Google account
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This phone number is already registered to another account"
        )
    
    # Send OTP (works for orphaned accounts and new numbers)
    try:
        send_otp(phone_number)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}"
        )

def verify_phone_number(
    phone_number: str,
    otp: str,
    user: User,
    db: Session
) -> None:
    """
    Verify OTP and attach phone to user account.
    
    If phone belongs to orphaned account, reclaim it (clear orphan's phone).
    """
    from utils.otp_utils import verify_otp
    from Shared.models.zapigo_api_models import UserStatus
    
    # Verify OTP
    try:
        if not verify_otp(phone_number, otp):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP verification failed: {str(e)}"
        )
    
    # Check if phone already belongs to active Google account
    existing_user = get_user_by_phone(db, phone_number)
    if existing_user and existing_user.id != user.id:
        if existing_user.google_sub and existing_user.status == UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This phone number is already registered to another account"
            )
        
        # Phone belongs to orphaned account - clear it
        existing_user.phone_number = None
        db.commit()
    
    # Attach phone to current user
    user.phone_number = phone_number
    db.commit()

def merge_phone_account(
    phone_number: str,
    otp: str,
    new_user: User,  # User with google_sub
    db: Session
) -> tuple[User, str, str]:
    """
    Merge new Google account into old OTP account.
    
    - Verifies phone OTP
    - Transfers google_sub to old account
    - Blocks new account
    - Returns new tokens for old account
    """
    from utils.otp_utils import verify_otp
    from Shared.models.zapigo_api_models import UserStatus
    
    # Verify OTP
    try:
        if not verify_otp(phone_number, otp):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP verification failed: {str(e)}"
        )
    
    # Find old OTP account
    old_user = get_user_by_phone(db, phone_number)
    if not old_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this phone number"
        )
    
    # Check if phone is already linked to this user
    if old_user.id == new_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This phone number is already linked to your account"
        )
    
    # Check if old account has active Google account
    if old_user.google_sub and old_user.status == UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This phone number is linked to an active Google account and cannot be merged"
        )
    
    # Transfer google_sub to old account
    old_user.google_sub = new_user.google_sub
    
    # Block new account
    new_user.status = UserStatus.BLOCKED
    
    db.commit()
    
    # Return new tokens for old account
    access_token, refresh_token = create_token_pair(old_user.id)
    return old_user, access_token, refresh_token
```

**Important:** Add `from Shared.models.zapigo_api_models import get_db` at the top.

### 4. Create `routers/auth_legacy/controller.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Shared.models.zapigo_api_models import get_db
from .model import (
    GoogleLoginRequest,
    GoogleLoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    SendPhoneOTPRequest,
    SendOTPResponse,
    VerifyPhoneRequest,
    VerifyPhoneResponse,
    MergeAccountRequest,
    MergeAccountResponse,
    UserResponse,
)
from .service import (
    login_with_google,
    verify_token,
    send_phone_otp,
    verify_phone_number,
    merge_phone_account,
    create_token_pair,
    get_current_active_user,
)

router = APIRouter(prefix="/c56/auth", tags=["auth"])

@router.post("/login", response_model=GoogleLoginResponse)
async def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login using Google ID token.
    
    Returns access token, refresh token, and user info.
    If is_new_user=true, frontend can offer account merge flow.
    """
    user, access_token, refresh_token, is_new_user = login_with_google(
        request.id_token,
        db
    )
    
    return GoogleLoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        is_new_user=is_new_user,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            phone_number=user.phone_number
        )
    )

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Get new access token using refresh token.
    """
    payload = verify_token(request.refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    access_token, _ = create_token_pair(user_id)
    
    return RefreshTokenResponse(access_token=access_token)

@router.post("/send-phone-otp", response_model=SendOTPResponse)
async def send_otp(
    request: SendPhoneOTPRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Send OTP to phone number.
    
    Requires authentication.
    Returns 409 if phone already registered to active Google account.
    """
    send_phone_otp(request.phone_number, db)
    return SendOTPResponse(message="OTP sent successfully")

@router.post("/verify-phone", response_model=VerifyPhoneResponse)
async def verify_phone(
    request: VerifyPhoneRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Verify phone number with OTP.
    
    Attaches verified phone to current user.
    Requires authentication.
    """
    verify_phone_number(
        request.phone_number,
        request.otp,
        current_user,
        db
    )
    
    return VerifyPhoneResponse(
        message="Phone number verified successfully",
        phone_number=request.phone_number
    )

@router.post("/merge-phone-account", response_model=MergeAccountResponse)
async def merge_account(
    request: MergeAccountRequest,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Merge current (new) Google account into existing OTP-era account.
    
    - Verifies phone with OTP
    - Transfers google_sub to old account
    - Blocks new empty account
    - Returns new tokens for old account
    
    Requires authentication with new account's token.
    """
    if not current_user.google_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account merge is only available for new Google accounts"
        )
    
    old_user, access_token, refresh_token = merge_phone_account(
        request.phone_number,
        request.otp,
        current_user,
        db
    )
    
    return MergeAccountResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=old_user.id
    )
```

---

## Phase 6: Update Dependent Files

### Update Imports in Existing Files

**`routers/image.py`:**
```python
from routers.auth_legacy.service import get_current_active_user

# Rest of file unchanged
```

**`routers/events/controller.py`:**
```python
from routers.auth_legacy.service import get_current_active_user

# Rest of file unchanged
```

**`routers/events/service.py`:**
```python
from routers.auth_legacy.service import get_current_active_user

# Rest of file unchanged
```

**`routers/event_config/controller.py`:**
```python
from routers.auth_legacy.service import get_current_active_user

# Rest of file unchanged
```

**`routers/shopCreds.py`:**
```python
from routers.auth_legacy.service import get_current_active_user

# Rest of file unchanged
```

**`routers/agenda/controller.py`:**
```python
from routers.auth_legacy.service import get_current_active_user

# Rest of file unchanged
```

**`routers/user_routes.py`:**
Make `phone_number` nullable in user creation/update endpoints:
```python
# In CreateUserRequest or similar schema:
phone_number: Optional[str] = None

# In any endpoint that accesses phone_number:
if user.phone_number:
    # Use phone number
else:
    # Handle null case
```

### Update main.py

```python
from fastapi import FastAPI
# ... other imports ...
from routers.auth_legacy.controller import router as auth_router

app = FastAPI()

# Include auth routes
app.include_router(auth_router)

# Include other routers...
```

---

## Phase 7: Database Migration (Alembic)

### 1. Update User Model

**`Shared/models/zapigo_api_models.py`:**

```python
from sqlalchemy import Column, String, Enum, DateTime
from datetime import datetime
import enum

class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"
    DELETED = "deleted"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True, unique=True)  # <- CHANGED: nullable
    google_sub = Column(String, nullable=True, unique=True)     # <- NEW
    picture = Column(String, nullable=True)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 2. Create Alembic Migration

```bash
cd Backend
alembic revision --autogenerate -m "add_google_sub_make_phone_nullable"
```

**Review the generated `alembic/versions/xxxxx_add_google_sub_make_phone_nullable.py`:**

```python
"""add_google_sub_make_phone_nullable

Revision ID: abc123def456
Revises: previous_revision
Create Date: 2024-05-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "abc123def456"
down_revision = "previous_revision"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make phone_number nullable
    op.alter_column(
        'users',
        'phone_number',
        existing_type=sa.VARCHAR(),
        nullable=True
    )
    
    # Add google_sub column
    op.add_column(
        'users',
        sa.Column('google_sub', sa.VARCHAR(255), nullable=True)
    )
    
    # Make google_sub unique
    op.create_unique_constraint(
        'uq_users_google_sub',
        'users',
        ['google_sub']
    )


def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('uq_users_google_sub', 'users')
    
    # Remove google_sub column
    op.drop_column('users', 'google_sub')
    
    # Make phone_number NOT NULL again
    op.alter_column(
        'users',
        'phone_number',
        existing_type=sa.VARCHAR(),
        nullable=False
    )
```

### 3. Run Migration

```bash
alembic upgrade head
```

---

## Environment Variables

Add to `.env` (development) and `.env.prd` (production):

```
# Google OAuth
GOOGLE_CLIENT_IDS=123-web.apps.googleusercontent.com,456-android.apps.googleusercontent.com,789-ios.apps.googleusercontent.com

# JWT (existing)
JWT_AUTH_SECRET_KEY=your-secret-key-here
JWT_AUTH_ALGO=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=15

# OTP (existing)
MSG91_AUTH_KEY=your-msg91-key
MSG91_TEMPLATE_ID=your-template-id
```

---

## Dependencies

Add to `Backend/requirements.txt`:

```
google-auth>=2.0.0
google-auth-httplib2>=0.2.0
google-auth-oauthlib>=1.0.0
python-jose[cryptography]>=3.3.0
```

Install:

```bash
pip install google-auth>=2.0.0 python-jose[cryptography]>=3.3.0
```

---

## Testing Checklist

- [ ] Start server, verify `/docs` shows new endpoints
- [ ] Test `POST /c56/auth/login` with valid Google ID token
  - Should create new user and return `is_new_user: true`
- [ ] Test login with same Google account again
  - Should return `is_new_user: false`
- [ ] Test login with Google account matching existing email
  - Should link to existing user (account linking)
  - Should return `is_new_user: false`
- [ ] Test `POST /c56/auth/refresh` with valid refresh token
- [ ] Test `POST /c56/auth/send-phone-otp` (requires auth)
- [ ] Test `POST /c56/auth/verify-phone` (requires auth, valid OTP)
- [ ] Test `POST /c56/auth/merge-phone-account` (requires auth, valid OTP)
- [ ] Verify existing endpoints still work (`/routers/image`, `/routers/events`, etc.)
- [ ] Test database: verify `google_sub` and nullable `phone_number`

---

## Common Errors & Fixes

### 1. "Invalid ID token"
**Cause:** Google Client ID in `GOOGLE_CLIENT_IDS` doesn't match the one used by frontend
**Fix:** Ensure frontend is using the exact Client ID from Google Cloud Console

### 2. "Email not verified by Google"
**Cause:** User's Google account has unverified email
**Fix:** User should verify email in Google account settings

### 3. "FAILED: (psycopg.errors.InFailedSqlTransaction)"
**Cause:** Bare `except` blocks not calling `db.rollback()` after error
**Fix:** Add `db.rollback()` in all bare `except` blocks in service functions

### 4. "phone_number already exists" on merge
**Cause:** Phone number is linked to active Google account
**Fix:** This is expected - merge endpoint returns 409 Conflict if phone is taken by active account

---

## Next Steps

1. Copy all files to your `Backend/` repo
2. Create `routers/auth_legacy/` directory
3. Add files: `__init__.py`, `model.py`, `service.py`, `controller.py`
4. Update import paths in existing files
5. Update `Shared/models/zapigo_api_models.py`
6. Create and run Alembic migration
7. Add `GOOGLE_CLIENT_IDS` to `.env`
8. Test all endpoints

---

## Questions?

Refer to the backend spec document `OAUTH_FLOW_SETUP.md` for architecture details.
