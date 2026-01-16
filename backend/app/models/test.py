from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.student import Student


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    subject_id = Column(
        Integer, ForeignKey("subjects.id"), nullable=True
    )  # nullable for back-compat or logic? Start nullable.

    subject = relationship("app.models.subject.Subject", back_populates="tests")
    questions = relationship("Question", back_populates="test")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    text = Column(String)
    image = Column(String, nullable=True)  # Path to image e.g. /static/filename.jpg
    options = Column(
        JSON
    )  # List of strings or objects. Now supports objects like {text: "...", image: "..."}
    correct_option = Column(Integer)  # Index of the correct option

    test = relationship("Test", back_populates="questions")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    test_id = Column(Integer, ForeignKey("tests.id"))
    score = Column(Float)
    taken_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student")
    test = relationship("Test")
