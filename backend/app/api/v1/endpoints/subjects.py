from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, Subject as SubjectSchema, SubjectUpdate

router = APIRouter()


@router.get("/", response_model=List[SubjectSchema])
async def read_subjects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_admin) # Allow students to see subjects too?
):
    result = await db.execute(select(Subject).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/", response_model=SubjectSchema)
async def create_subject(
    subject_in: SubjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    result = await db.execute(select(Subject).where(Subject.name == subject_in.name))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Subject already exists")

    subject = Subject(name=subject_in.name)
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.delete("/{subject_id}", response_model=SubjectSchema)
async def delete_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    await db.delete(subject)
    await db.commit()
    return subject
