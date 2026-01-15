from sqlalchemy import Column, Integer, String, ARRAY, Float
from app.core.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    student_id = Column(String, unique=True, index=True)
    group_id = Column(String, index=True)
    photo_path = Column(String, nullable=True)

    # Store face encoding as a list of floats (128 dimensions for dlib/face_recognition)
    face_encoding = Column(ARRAY(Float), nullable=True)
