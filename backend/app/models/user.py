from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="admin")  # 'admin' or 'teacher'

    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)
