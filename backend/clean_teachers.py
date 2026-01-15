import asyncio
from app.core.database import AsyncSessionLocal
from app.models.teacher import Teacher
from sqlalchemy import text


async def clear_teachers():
    async with AsyncSessionLocal() as db:
        await db.execute(text("TRUNCATE TABLE teachers CASCADE"))
        await db.commit()
    print("Teachers table cleared.")


if __name__ == "__main__":
    asyncio.run(clear_teachers())
