import io
import os
import uuid
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile, status

from app.modules.certificates.storage_service import get_storage_service

DEFAULT_CERTIFICATES_FOLDER = "certificates"
ALLOWED_CERTIFICATE_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}

BACKEND_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BACKEND_DIR / ".env")


class CertificateService:
    def __init__(self):
        self.storage = get_storage_service()
        self.folder = os.getenv("CERTIFICATES_FOLDER", DEFAULT_CERTIFICATES_FOLDER).strip("/") or DEFAULT_CERTIFICATES_FOLDER

    @staticmethod
    def _extension(filename: str | None) -> str:
        if not filename or "." not in filename:
            return ""
        return "." + filename.rsplit(".", 1)[-1].lower()

    def _validate_upload(self, file: UploadFile) -> None:
        ext = self._extension(file.filename)
        if ext not in ALLOWED_CERTIFICATE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Certificate file must be PDF, PNG, JPG or JPEG",
            )

    def _build_object_name(
        self,
        owner_type: str,
        owner_id: int,
        course_id: int,
        certificate_id: str | None,
        extension: str,
    ) -> str:
        cert_id = certificate_id or uuid.uuid4().hex
        return f"{self.folder}/{owner_type}/{owner_id}/{course_id}/{cert_id}{extension}"

    def build_certificate_object_name(
        self,
        owner_type: str,
        owner_id: int,
        course_id: int,
        filename: str,
        certificate_id: str | None = None,
    ) -> str:
        extension = self._extension(filename)
        if extension not in ALLOWED_CERTIFICATE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Certificate file must be PDF, PNG, JPG or JPEG",
            )
        return self._build_object_name(
            owner_type=owner_type,
            owner_id=owner_id,
            course_id=course_id,
            certificate_id=certificate_id,
            extension=extension,
        )

    def upload_certificate_file(
        self,
        file: UploadFile,
        owner_type: str,
        owner_id: int,
        course_id: int,
        certificate_id: str | None = None,
    ) -> Optional[dict]:
        self._validate_upload(file=file)

        extension = self._extension(file.filename) or ".pdf"
        object_name = self._build_object_name(
            owner_type=owner_type,
            owner_id=owner_id,
            course_id=course_id,
            certificate_id=certificate_id,
            extension=extension,
        )

        file.file.seek(0)
        file_url = self.storage.upload_file(
            file=file.file,
            object_name=object_name,
            content_type=file.content_type or "application/pdf",
        )
        if not file_url:
            return None

        return {
            "url": file_url,
            "object_name": object_name,
            "filename": file.filename,
            "content_type": file.content_type or "application/pdf",
        }

    def save_certificate(
        self,
        certificate_file: bytes,
        student_id: int,
        course_id: int,
        certificate_id: str,
        extension: str = ".pdf",
    ) -> Optional[str]:
        if extension.lower() not in ALLOWED_CERTIFICATE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Certificate file must be PDF, PNG, JPG or JPEG",
            )

        object_name = self._build_object_name(
            owner_type="students",
            owner_id=student_id,
            course_id=course_id,
            certificate_id=certificate_id,
            extension=extension.lower(),
        )
        file_obj = io.BytesIO(certificate_file)
        return self.storage.upload_file(
            file=file_obj,
            object_name=object_name,
            content_type="application/pdf" if extension.lower() == ".pdf" else "image/jpeg",
        )


_certificate_service: Optional[CertificateService] = None


def get_certificate_service() -> CertificateService:
    global _certificate_service
    if _certificate_service is None:
        _certificate_service = CertificateService()
    return _certificate_service
