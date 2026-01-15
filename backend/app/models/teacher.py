from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    passport_serial = Column(String, nullable=False, unique=True)
    jshshir = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)

    user = relationship("User", back_populates="teacher_profile")
