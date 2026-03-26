from urllib.parse import urlparse

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.modules.certificates.certificate_service import get_certificate_service
from app.modules.certificates.repository import CertificatesRepository
from app.modules.certificates.schemas import (
    CertificatePresignUploadIn,
)


class CertificatesAppService:
    def __init__(self, db: Session):
        self.repository = CertificatesRepository(db=db)
        self.certificate_service = get_certificate_service()
        self.storage = self.certificate_service.storage

    @staticmethod
    def _is_admin(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Admin"

    @staticmethod
    def _is_teacher(current_user: dict) -> bool:
        return current_user["user_type"] == "staff" and current_user.get("staff_role") == "Teacher"

    @staticmethod
    def _extract_object_key(url_or_key: str, bucket_name: str | None) -> str:
        if "://" not in url_or_key:
            return url_or_key.lstrip("/")

        parsed = urlparse(url_or_key)
        path = parsed.path.lstrip("/")
        if not path:
            return ""

        host = parsed.netloc
        if bucket_name and host.startswith(f"{bucket_name}."):
            return path

        if bucket_name and path.startswith(f"{bucket_name}/"):
            return path[len(bucket_name) + 1 :]

        return path

    def _validate_entities(self, student_id: int | None, teacher_id: int | None, course_id: int) -> None:
        course = self.repository.get_course_by_id(course_id=course_id)
        if course is None:
            raise HTTPException(status_code=404, detail="Course not found")

        if student_id is not None:
            student = self.repository.get_student_by_id(student_id=student_id)
            if student is None:
                raise HTTPException(status_code=404, detail="Student not found")

        if teacher_id is not None:
            teacher = self.repository.get_staff_by_id(staff_id=teacher_id)
            if teacher is None:
                raise HTTPException(status_code=404, detail="Teacher not found")

    def create_presigned_upload(self, data: CertificatePresignUploadIn, current_user: dict) -> dict:
        if data.owner_type == "students":
            if not (self._is_admin(current_user) or self._is_teacher(current_user)):
                raise HTTPException(status_code=403, detail="Teacher/Admin access required")
            self._validate_entities(student_id=data.owner_id, teacher_id=None, course_id=data.course_id)
            if self._is_teacher(current_user):
                if not self.repository.is_teacher_course_owner(
                    course_id=data.course_id,
                    teacher_id=current_user["user"].id,
                ):
                    raise HTTPException(status_code=403, detail="Access denied")
        else:
            if not self._is_admin(current_user):
                raise HTTPException(status_code=403, detail="Admin access required")
            self._validate_entities(student_id=None, teacher_id=data.owner_id, course_id=data.course_id)

        object_key = self.certificate_service.build_certificate_object_name(
            owner_type=data.owner_type,
            owner_id=data.owner_id,
            course_id=data.course_id,
            filename=data.filename,
        )
        upload_url = self.storage.generate_presigned_upload_url(
            object_name=object_key,
            content_type=data.content_type or "application/octet-stream",
            expiration=900,
        )
        if not upload_url:
            raise HTTPException(status_code=500, detail="Failed to create upload URL")

        return {"upload_url": upload_url, "object_key": object_key}

    def upload_student_certificate(
        self,
        file: UploadFile,
        student_id: int,
        course_id: int,
        current_user: dict,
    ):
        if not (self._is_admin(current_user) or self._is_teacher(current_user)):
            raise HTTPException(status_code=403, detail="Teacher/Admin access required")

        self._validate_entities(student_id=student_id, teacher_id=None, course_id=course_id)

        if self._is_teacher(current_user):
            if not self.repository.is_teacher_course_owner(course_id=course_id, teacher_id=current_user["user"].id):
                raise HTTPException(status_code=403, detail="Access denied")

        uploaded = self.certificate_service.upload_certificate_file(
            file=file,
            owner_type="students",
            owner_id=student_id,
            course_id=course_id,
        )
        if uploaded is None:
            raise HTTPException(status_code=500, detail="Failed to upload certificate")

        return self.repository.save_student_certificate(
            student_id=student_id,
            course_id=course_id,
            issued_by=current_user["user"].id,
            certificate_url=uploaded["url"],
        )

    def upload_teacher_certificate(
        self,
        file: UploadFile,
        user_id: int,
        course_id: int,
        current_user: dict,
    ):
        if not self._is_admin(current_user):
            raise HTTPException(status_code=403, detail="Admin access required")

        self._validate_entities(student_id=None, teacher_id=user_id, course_id=course_id)

        uploaded = self.certificate_service.upload_certificate_file(
            file=file,
            owner_type="teachers",
            owner_id=user_id,
            course_id=course_id,
        )
        if uploaded is None:
            raise HTTPException(status_code=500, detail="Failed to upload certificate")

        return self.repository.save_teacher_certificate(
            user_id=user_id,
            course_id=course_id,
            issued_by=current_user["user"].id,
            certificate_url=uploaded["url"],
        )

    def list_my_student_certificates(self, current_user: dict):
        if current_user["user_type"] != "student":
            raise HTTPException(status_code=403, detail="Student access required")
        return self.repository.list_student_certificates(student_id=current_user["user"].id)

    def list_my_teacher_certificates(self, current_user: dict):
        if not self._is_teacher(current_user):
            raise HTTPException(status_code=403, detail="Teacher access required")
        return self.repository.list_teacher_certificates(teacher_id=current_user["user"].id)

    def get_student_certificate_download_url(self, certificate_id: int, current_user: dict) -> str:
        certificate = self.repository.get_student_certificate_by_id(certificate_id=certificate_id)
        if certificate is None:
            raise HTTPException(status_code=404, detail="Certificate not found")

        allowed = False
        if self._is_admin(current_user):
            allowed = True
        elif current_user["user_type"] == "student" and current_user["user"].id == certificate.student_id:
            allowed = True
        elif self._is_teacher(current_user) and self.repository.is_teacher_course_owner(
            course_id=certificate.course_id,
            teacher_id=current_user["user"].id,
        ):
            allowed = True

        if not allowed:
            raise HTTPException(status_code=403, detail="Access denied")

        object_key = self._extract_object_key(
            url_or_key=certificate.certificate_url,
            bucket_name=self.storage.bucket_name,
        )
        if object_key:
            presigned = self.storage.generate_presigned_url(object_name=object_key, expiration=3600)
            if presigned:
                return presigned
        return certificate.certificate_url

    def get_teacher_certificate_download_url(self, certificate_id: int, current_user: dict) -> str:
        certificate = self.repository.get_teacher_certificate_by_id(certificate_id=certificate_id)
        if certificate is None:
            raise HTTPException(status_code=404, detail="Certificate not found")

        allowed = False
        if self._is_admin(current_user):
            allowed = True
        elif self._is_teacher(current_user) and current_user["user"].id == certificate.user_id:
            allowed = True

        if not allowed:
            raise HTTPException(status_code=403, detail="Access denied")

        object_key = self._extract_object_key(
            url_or_key=certificate.certificate_url,
            bucket_name=self.storage.bucket_name,
        )
        if object_key:
            presigned = self.storage.generate_presigned_url(object_name=object_key, expiration=3600)
            if presigned:
                return presigned
        return certificate.certificate_url
