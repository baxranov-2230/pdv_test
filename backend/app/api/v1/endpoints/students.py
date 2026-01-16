from datetime import timedelta
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.student import Student
from app.models.user import User
from app.api.deps import get_current_user, get_current_student
from app.services.face_service import FaceService
from app.core.security import settings
from app.core import security

# Dependency to ensure admin is logged in (simplified check for presence of user in token)
# Real implementation needs get_current_user dependency
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # If it's a student token, deny access to admin features
    # (Simple check: our admin tokens have username as sub, student tokens have student:ID)
    if username.startswith("student:"):
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/", response_model=None)
async def create_student(
    full_name: str = Form(...),
    student_id: str = Form(...),
    group_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Check if student_id exists
    result = await db.execute(select(Student).where(Student.student_id == student_id))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Student ID already exists")

    # Process Face
    try:
        encoding = await FaceService.get_face_encoding(file)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Save Student
    # Note: We are not saving the image file to disk to keep it simple, only the embedding.
    # In a real app, you'd save `file` to `uploads/` and store the path in `photo_path`.

    student = Student(
        full_name=full_name,
        student_id=student_id,
        group_id=group_id,
        face_encoding=encoding,
        photo_path="stored_as_embedding",  # Placeholder or path if we saved it
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return {
        "id": student.id,
        "full_name": student.full_name,
        "message": "Student created successfully",
    }


@router.get("/", response_model=List[dict])
async def read_students(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Student).offset(skip).limit(limit))
    students = result.scalars().all()
    # Return simple dicts to avoid serialization issues with face_encoding array if not handled by Pydantic schema
    return [
        {
            "id": s.id,
            "full_name": s.full_name,
            "student_id": s.student_id,
            "group_id": s.group_id,
        }
        for s in students
    ]


@router.post("/verify", response_model=dict)
async def verify_student(
    student_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> Any:
    # 1. Find Student
    result = await db.execute(select(Student).where(Student.student_id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not student.face_encoding:
        raise HTTPException(
            status_code=400, detail="Student has no registered face data"
        )

    # 2. Process Uploaded Face
    try:
        # We need to reset file pointer if it was read before, but here it's fresh.
        # However, FaceService.get_face_encoding expects UploadFile and reads it.
        # But wait, FaceService in previous turn (Step 907) uses `load_image_file(file.file)`.
        # This works directly with the file-like object.
        check_encoding = await FaceService.get_face_encoding(file)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing face: {str(e)}")

    # 3. Compare Faces
    # student.face_encoding is stored as a list (from JSON/ARRAY). verify_face expects list.
    is_match = FaceService.verify_face(student.face_encoding, check_encoding)

    if not is_match:
        raise HTTPException(
            status_code=401, detail="Bu siz emassiz. Tizim sizni tanimadi."
        )

    # 4. Generate Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={
            "sub": f"student:{student.student_id}",
            "role": "student",
            "student_db_id": student.id,
        },
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student": {
            "id": student.id,
            "full_name": student.full_name,
            "student_id": student.student_id,
        },
    }


@router.post("/verify-match", response_model=dict)
async def verify_student_match(
    file: UploadFile = File(...),
    current_student: Student = Depends(get_current_student),
) -> Any:
    """
    Verifies that the uploaded face matches the currently logged-in student.
    Used for pre-test verification.
    """
    if not current_student.face_encoding:
        raise HTTPException(
            status_code=400, detail="Student has no registered face data"
        )

    try:
        check_encoding = await FaceService.get_face_encoding(file)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing face: {str(e)}")

    is_match = FaceService.verify_face(current_student.face_encoding, check_encoding)

    if not is_match:
        raise HTTPException(
            status_code=401, detail="Bu siz emassiz. Tizim sizni tanimadi."
        )

    return {"success": True, "message": "Face verified successfully"}
