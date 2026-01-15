from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.student import Student

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Check if this is a student token
    if username.startswith("student:"):
        raise HTTPException(status_code=403, detail="Admins only")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_teacher(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user


async def get_current_student(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> Student:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if not sub.startswith("student:"):
        raise HTTPException(status_code=403, detail="Students only")

    student_id = sub.split(":", 1)[1]

    result = await db.execute(select(Student).where(Student.student_id == student_id))
    student = result.scalars().first()
    if student is None:
        raise credentials_exception
    return student
