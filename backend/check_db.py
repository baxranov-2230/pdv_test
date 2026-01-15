import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text


async def check_permissions():
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name = 'teachers'"
                )
            )
            columns = [row[0] for row in result.fetchall()]
            print(f"Teachers table columns: {columns}")
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(check_permissions())
