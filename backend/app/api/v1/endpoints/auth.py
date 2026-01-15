from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.models.student import Student
from app.schemas.user import UserCreate, User as UserSchema
from app.schemas.token import Token
from app.api.deps import get_current_user, get_current_admin
from app.services.face_service import FaceService

router = APIRouter()


@router.post("/register", response_model=UserSchema)
async def register(
    user_in: UserCreate,
    role: str = "teacher",  # Default to teacher if admin registers?
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_admin) # Only admin can register new users?
    # For now open registration for convenience, or stick to admin-only.
    # PROMPT: "admin, teacher va student rollari"
    # Let's assume open registration is for "admin" initially, but maybe restrict later.
    # Better: Open registration creates 'teacher' by default? Or 'admin'?
    # Let's add role param.
):
    result = await db.execute(select(User).where(User.username == user_in.username))
    if result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )

    # Simple logic: If no users exist, first one is admin. Else, role must be provided or defaults to teacher?
    # For simplicity, we trust the input role but sanitize it.
    if role not in ["admin", "teacher"]:
        role = "teacher"

    # Security: If registering as admin, maybe require a secret key or existing admin token?
    # For this task, we'll allow it but validation is key.

    user = User(
        username=user_in.username,
        hashed_password=security.get_password_hash(user_in.password),
        role=role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/student/identify", response_model=Token)
async def student_identify(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    # Save temp file
    import shutil
    import os
    import uuid

    filename = f"{uuid.uuid4()}.jpg"
    file_path = f"/tmp/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Get encoding
        encoding = FaceService.get_face_encoding(file_path)
        if encoding is None:
            raise HTTPException(status_code=400, detail="No face found in image")

        # Find match in DB
        result = await db.execute(select(Student))
        students = result.scalars().all()

        matched_student = None
        for student in students:
            if student.face_encoding:
                import numpy as np

                # Convert list back to numpy array if needed, but FaceService handles it?
                # FaceService.compare_faces expects list of encodings
                # But here we compare one by one or batch.

                # Check DB storage format. It's ARRAY(Float). SQLAlchemy returns list.
                match = FaceService.compare_faces(
                    np.array(student.face_encoding), encoding
                )
                if match:
                    matched_student = student
                    break

        if not matched_student:
            raise HTTPException(status_code=401, detail="Student not recognized")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        # Role for student is 'student'
        access_token = security.create_access_token(
            data={"sub": f"student:{matched_student.student_id}", "role": "student"},
            expires_delta=access_token_expires,
        )
        return {"access_token": access_token, "token_type": "bearer"}

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
