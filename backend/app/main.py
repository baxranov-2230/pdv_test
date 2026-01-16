from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Student Test Platform", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve static files
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

from app.core.database import engine, Base
from app.models import *  # Import models to ensure they are registered with Base
from app.api.v1.endpoints import auth


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
from app.api.v1.endpoints import students, tests, upload

app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
app.include_router(tests.router, prefix="/api/v1/tests", tags=["tests"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])

from app.api.v1.endpoints import teachers, subjects

app.include_router(teachers.router, prefix="/api/v1/teachers", tags=["teachers"])
app.include_router(subjects.router, prefix="/api/v1/subjects", tags=["subjects"])


@app.get("/")
async def root():
    return {"message": "Welcome to Student Test Platform API"}
