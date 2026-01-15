import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.teacher import Teacher
from sqlalchemy import select, delete


async def clean_orphan_user():
    async with AsyncSessionLocal() as db:
        # Check for the specific conflicting user
        username = "AB7436350"
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalars().first()

        if user:
            print(f"User {username} found. Checking for linked teacher...")
            teacher_result = await db.execute(
                select(Teacher).where(Teacher.user_id == user.id)
            )
            teacher = teacher_result.scalars().first()

            if teacher:
                print(f"User {username} has a linked teacher (ID: {teacher.id}).")
            else:
                print(f"User {username} is ORPHANED. Deleting...")
                await db.delete(user)
                await db.commit()
                print("Orphaned user deleted.")
        else:
            print(f"User {username} not found.")


if __name__ == "__main__":
    asyncio.run(clean_orphan_user())
