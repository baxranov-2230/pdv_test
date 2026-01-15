import face_recognition
import numpy as np
from fastapi import UploadFile, HTTPException


class FaceService:
    @staticmethod
    async def get_face_encoding(file: UploadFile):
        # Read image file
        image_data = await file.read()

        # Load image with face_recognition (requires numpy array)
        try:
            # We need to save it to a temp file or convert byte stream to numpy array
            # For simplicity using a temp file approach or assuming we can load from bytes slightly differently
            # face_recognition.load_image_file accepts a filename or file object.
            # SpooledTemporaryFile from UploadFile works as a file object.

            # Reset file pointer
            await file.seek(0)

            image = face_recognition.load_image_file(file.file)
            encodings = face_recognition.face_encodings(image)

            if not encodings:
                raise HTTPException(
                    status_code=400, detail="No face found in the image"
                )

            if len(encodings) > 1:
                raise HTTPException(
                    status_code=400, detail="Multiple faces found in the image"
                )

            return encodings[0].tolist()  # Convert numpy array to list for JSON storage
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error processing image: {str(e)}"
            )

    @staticmethod
    def verify_face(
        known_encoding: list, check_encoding: list, tolerance: float = 0.6
    ) -> bool:
        # data comes from DB as list, convert back to numpy array
        known_face_encoding = np.array(known_encoding)
        check_face_encoding = np.array(check_encoding)

        # compare_faces returns a list of True/False
        results = face_recognition.compare_faces(
            [known_face_encoding], check_face_encoding, tolerance=tolerance
        )
        return results[0]
