from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.test import Test, Question, Result
from app.models.student import Student
from app.api.deps import get_current_user, get_current_student
from app.schemas import test as test_schema
from app.models.user import User

router = APIRouter()


@router.post("/", response_model=test_schema.Test)
async def create_test(
    test_in: test_schema.TestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        test = Test(
            title=test_in.title,
            description=test_in.description,
            subject_id=test_in.subject_id,
        )
        db.add(test)
        await db.flush()  # Get ID

        for q in test_in.questions:
            if q.correct_option >= len(q.options):
                raise HTTPException(
                    status_code=400,
                    detail=f"Correct option index {q.correct_option} is out of bounds for question '{q.text}'",
                )

            question = Question(
                test_id=test.id,
                text=q.text,
                options=q.options,
                correct_option=q.correct_option,
            )
            db.add(question)

        await db.commit()
        await db.refresh(test)

        # Eager load questions for response
        result = await db.execute(
            select(Test)
            .options(selectinload(Test.questions), selectinload(Test.subject))
            .where(Test.id == test.id)
        )
        test_loaded = result.scalars().first()
        return test_loaded

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import logging

        logging.error(f"Error creating test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{test_id}", response_model=test_schema.Test)
async def update_test(
    test_id: int,
    test_in: test_schema.TestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(select(Test).where(Test.id == test_id))
        test = result.scalars().first()
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        # Update fields
        test.title = test_in.title
        test.description = test_in.description
        test.subject_id = test_in.subject_id

        # Replace questions - delete existing and add new
        # Note: This changes question IDs. For a simple app this is acceptable.
        # Ideally, we would diff and update.

        # Delete existing questions
        q_result = await db.execute(select(Question).where(Question.test_id == test_id))
        existing_questions = q_result.scalars().all()
        for q in existing_questions:
            await db.delete(q)

        await db.flush()

        # Add new questions
        for q in test_in.questions:
            if q.correct_option >= len(q.options):
                raise HTTPException(
                    status_code=400,
                    detail=f"Correct option index {q.correct_option} is out of bounds for question '{q.text}'",
                )

            question = Question(
                test_id=test.id,
                text=q.text,
                options=q.options,
                correct_option=q.correct_option,
            )
            db.add(question)

        await db.commit()
        await db.refresh(test)

        # Eager load questions for response
        result = await db.execute(
            select(Test)
            .options(selectinload(Test.questions), selectinload(Test.subject))
            .where(Test.id == test.id)
        )
        test_loaded = result.scalars().first()
        return test_loaded
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import logging

        logging.error(f"Error updating test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(select(Test).where(Test.id == test_id))
        test = result.scalars().first()
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")

        # Questions and Results should cascade delete if configured in DB,
        # but let's be explicit if needed or rely on cascade.
        # Assuming cascade is not guaranteed, let's try to delete.
        # Actually in SQLAlchemy asyncio, we delete the object.
        await db.delete(test)
        await db.commit()
    except Exception as e:
        await db.rollback()
        import logging

        logging.error(f"Error deleting test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[test_schema.Test])
async def read_tests(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Test)
        .options(selectinload(Test.questions), selectinload(Test.subject))
        .order_by(Test.id.desc())
    )
    tests = result.scalars().all()
    return tests


@router.get("/{test_id}", response_model=test_schema.Test)
async def get_test(test_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Test)
        .options(selectinload(Test.questions), selectinload(Test.subject))
        .where(Test.id == test_id)
    )
    test = result.scalars().first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test


@router.post("/submit", response_model=dict)
async def submit_test(
    submission: test_schema.ResultSubmit,
    db: AsyncSession = Depends(get_db),
    student: Student = Depends(get_current_student),
):
    result = await db.execute(
        select(Test)
        .options(selectinload(Test.questions))
        .where(Test.id == submission.test_id)
    )
    test = result.scalars().first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    correct_count = 0
    total_questions = len(test.questions)

    # Sort questions by ID to ensure order matches submission if that's the contract
    # Ideally, submission should include question_id map
    questions_sorted = sorted(test.questions, key=lambda q: q.id)

    if len(submission.answers) != total_questions:
        # Handle mismatch
        pass

    for i, answer_idx in enumerate(submission.answers):
        if i < len(questions_sorted):
            if questions_sorted[i].correct_option == answer_idx:
                correct_count += 1

    score = (correct_count / total_questions) * 100 if total_questions > 0 else 0

    result_obj = Result(student_id=student.id, test_id=test.id, score=score)
    db.add(result_obj)
    await db.commit()

    return {"message": "Test submitted successfully", "score": score}


@router.get("/results/all", response_model=List[dict])
async def get_all_results(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Result).options(selectinload(Result.student), selectinload(Result.test))
    )
    results = result.scalars().all()

    return [
        {
            "id": r.id,
            "student_name": r.student.full_name if r.student else "Unknown",
            "test_title": r.test.title if r.test else "Unknown",
            "score": r.score,
            "taken_at": r.taken_at,
        }
        for r in results
    ]


@router.get("/results/my", response_model=List[dict])
async def get_my_results(
    db: AsyncSession = Depends(get_db),
    current_student: Student = Depends(get_current_student),
):
    result = await db.execute(
        select(Result)
        .options(selectinload(Result.test))
        .where(Result.student_id == current_student.id)
    )
    results = result.scalars().all()

    return [
        {
            "id": r.id,
            "test_title": r.test.title if r.test else "Unknown",
            "score": r.score,
            "taken_at": r.taken_at,
        }
        for r in results
    ]
