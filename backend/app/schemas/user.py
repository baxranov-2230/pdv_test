from typing import Optional
from pydantic import BaseModel


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str
    role: str = "teacher"


class UserUpdate(BaseModel):
    password: Optional[str] = None


class User(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True
