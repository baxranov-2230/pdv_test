from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.subject import Subject as SubjectSchema  # Import


class QuestionBase(BaseModel):
    text: str
    options: List[str] = Field(
        ..., min_items=2, description="List of options, minimum 2"
    )
    correct_option: int = Field(..., ge=0, description="Index of the correct option")


class QuestionCreate(QuestionBase):
    pass


class Question(QuestionBase):
    id: int
    test_id: int

    class Config:
        from_attributes = True


class TestBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: Optional[int] = None  # Add subject_id


class TestCreate(TestBase):
    questions: List[QuestionCreate]


class TestUpdate(TestBase):
    questions: List[QuestionCreate]


class Test(TestBase):
    id: int
    questions: List[Question] = []
    subject: Optional[SubjectSchema] = None  # Add subject response

    class Config:
        from_attributes = True


class ResultSubmit(BaseModel):
    test_id: int
    answers: List[int]
