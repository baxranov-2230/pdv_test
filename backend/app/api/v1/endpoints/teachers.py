from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core import security
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate, Teacher as TeacherSchema

router = APIRouter()


@router.get("/", response_model=List[TeacherSchema])
async def read_teachers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Retrieve all teachers with user info.
    """
    result = await db.execute(select(Teacher).options(selectinload(Teacher.user)))
    teachers = result.scalars().all()
    return teachers


@router.post("/", response_model=TeacherSchema)
async def create_teacher(
    teacher_in: TeacherCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Create a new teacher (and underlying User).
    """
    # Check if user exists
    result = await db.execute(
        select(User).where(User.username == teacher_in.passport_serial)
    )
    if result.scalars().first():
        # Clean up orphan user if no teacher profile exists?
        # For now, just raise error. Or better: check if Teacher profile exists too.
        # But for simplicity, assume username conflict is a blocker.
        raise HTTPException(
            status_code=400,
            detail="The user with this passport serial already exists.",
        )

    # 1. Create User
    user = User(
        username=teacher_in.passport_serial,
        hashed_password=security.get_password_hash(teacher_in.jshshir),
        role="teacher",
    )
    db.add(user)
    await db.flush()  # Get ID

    # 2. Create Teacher Profile
    teacher = Teacher(
        user_id=user.id,
        full_name=teacher_in.full_name,
        passport_serial=teacher_in.passport_serial,
        jshshir=teacher_in.jshshir,
        phone_number=teacher_in.phone_number,
    )
    db.add(teacher)

    await db.commit()
    await db.refresh(teacher)
    # Re-fetch with user relation for response
    result = await db.execute(
        select(Teacher)
        .options(selectinload(Teacher.user))
        .where(Teacher.id == teacher.id)
    )
    return result.scalars().first()


@router.put("/{teacher_id}", response_model=TeacherSchema)
async def update_teacher(
    teacher_id: int,
    teacher_in: TeacherUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Update a teacher's information.
    """
    result = await db.execute(
        select(Teacher)
        .options(selectinload(Teacher.user))
        .where(Teacher.id == teacher_id)
    )
    teacher = result.scalars().first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Update Profile
    # Update Profile
    if teacher_in.full_name:
        teacher.full_name = teacher_in.full_name
    if teacher_in.phone_number:
        teacher.phone_number = teacher_in.phone_number
    if teacher_in.jshshir:
        teacher.jshshir = teacher_in.jshshir
        # Update password if jshshir changes (and no manual password override provided?)
        # Logic: JSHSHIR is the password.
        teacher.user.hashed_password = security.get_password_hash(teacher_in.jshshir)

    if teacher_in.passport_serial:
        teacher.passport_serial = teacher_in.passport_serial
        # Update username if passport changes
        teacher.user.username = teacher_in.passport_serial

    # Allow manual password override if strictly needed, but JSHSHIR usually governs it
    if teacher_in.password:
        teacher.user.hashed_password = security.get_password_hash(teacher_in.password)

    db.add(teacher)
    db.add(teacher.user)  # Ensure user update is tracked
    await db.commit()
    await db.refresh(teacher)
    return teacher


@router.delete("/{teacher_id}", response_model=TeacherSchema)
async def delete_teacher(
    teacher_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """
    Delete a teacher.
    """
    result = await db.execute(
        select(Teacher)
        .options(selectinload(Teacher.user))
        .where(Teacher.id == teacher_id)
    )
    teacher = result.scalars().first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Delete User (cascade should theoretically handle teacher, or vice versa)
    # Safest is to delete Teacher first then User, or if Cascade Delete is set on DB.
    # Here we manually delete both for safety if not configured.
    user_to_delete = teacher.user

    await db.delete(teacher)
    if user_to_delete:
        await db.delete(user_to_delete)

    await db.commit()
    return teacher
