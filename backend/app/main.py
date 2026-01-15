from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Student Test Platform", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.database import engine, Base
from app.models import *  # Import models to ensure they are registered with Base
from app.api.v1.endpoints import auth


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
from app.api.v1.endpoints import students, tests

app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
app.include_router(tests.router, prefix="/api/v1/tests", tags=["tests"])

from app.api.v1.endpoints import teachers, subjects

app.include_router(teachers.router, prefix="/api/v1/teachers", tags=["teachers"])
app.include_router(subjects.router, prefix="/api/v1/subjects", tags=["subjects"])


@app.get("/")
async def root():
    return {"message": "Welcome to Student Test Platform API"}
