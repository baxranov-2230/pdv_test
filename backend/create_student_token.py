import asyncio
from app.core.database import AsyncSessionLocal
from app.models.student import Student
from app.core import security
from datetime import timedelta
from sqlalchemy.future import select


async def create_token():
    async with AsyncSessionLocal() as db:
        student_id = "test_student_001"
        res = await db.execute(select(Student).where(Student.student_id == student_id))
        student = res.scalars().first()

        if not student:
            print(f"Creating student {student_id}")
            # Dummy encoding
            dummy_encoding = [0.1] * 128
            student = Student(
                full_name="Test Student",
                student_id=student_id,
                group_id="G1",
                face_encoding=dummy_encoding,
            )
            db.add(student)
            await db.commit()
            await db.refresh(student)

        token = security.create_access_token(
            data={
                "sub": f"student:{student.student_id}",
                "role": "student",
                "student_db_id": student.id,
            },
            expires_delta=timedelta(hours=1),
        )
        print(f"TOKEN: {token}")


if __name__ == "__main__":
    asyncio.run(create_token())
