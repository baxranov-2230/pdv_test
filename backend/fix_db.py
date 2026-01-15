import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/pdv_test"
)


async def fix_db():
    print(f"Connecting to {DATABASE_URL}")
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        # Check version
        try:
            res = await conn.execute(text("SELECT version_num FROM alembic_version"))
            version = res.scalar()
            print(f"Current Alembic Version: {version}")
        except Exception as e:
            print(f"Could not get version: {e}")

        # Check columns
        res = await conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"
            )
        )
        columns = [c[0] for c in res.fetchall()]
        print(f"Columns before: {columns}")

        if "role" not in columns:
            print("Adding role column...")
            await conn.execute(
                text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'admin'")
            )
            print("Column added.")
        else:
            print("Role column already exists.")

        # Verify
        res = await conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"
            )
        )
        columns = [c[0] for c in res.fetchall()]
        print(f"Columns after: {columns}")


if __name__ == "__main__":
    asyncio.run(fix_db())
