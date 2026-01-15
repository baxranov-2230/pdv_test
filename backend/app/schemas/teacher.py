from typing import Optional
from pydantic import BaseModel
from app.schemas.user import User


class TeacherBase(BaseModel):
    full_name: str
    passport_serial: str
    jshshir: str
    phone_number: Optional[str] = None


class TeacherCreate(TeacherBase):
    pass
    # username and password derived from passport and jshshir


class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    passport_serial: Optional[str] = None
    jshshir: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None


class Teacher(TeacherBase):
    id: int
    user_id: int
    user: Optional[User] = None

    class Config:
        from_attributes = True
