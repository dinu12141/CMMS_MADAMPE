from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from typing import List
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from models import UserCreate, UserInDB, User
from database import get_database, generate_unique_number, add_timestamps, doc_with_id

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Available roles
ROLES = ["Administrator", "Engineering Manager", "CEO", "DGM", "Supervisor", "Technician", "Electrician"]

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db, username: str):
    users = db.collection("users").where("username", "==", username).limit(1).stream()
    for user_doc in users:
        user_data = doc_with_id(user_doc)
        if user_data:
            return UserInDB(**user_data)

def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

@router.post("/register", response_model=User)
def register_user(user: UserCreate):
    db = get_database()

    users_collection = db.collection("users")

    existing_user = list(users_collection.where("username", "==", user.username).limit(1).stream())
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = list(users_collection.where("email", "==", user.email).limit(1).stream())
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate role
    if user.role not in ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(ROLES)}"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Generate user ID
    user_id = generate_unique_number("users", "USER")
    
    user_dict = {
        "userId": user_id,
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "role": user.role,
        "department": user.department,
        "phone": user.phone,
        "active": True
    }
    user_dict = add_timestamps(user_dict)

    doc_ref = users_collection.document()
    user_dict["_id"] = doc_ref.id
    user_dict["id"] = doc_ref.id
    doc_ref.set(user_dict)

    return User(**{k: v for k, v in user_dict.items() if k != "hashed_password"})

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    db = get_database()
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if not current_user.active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user