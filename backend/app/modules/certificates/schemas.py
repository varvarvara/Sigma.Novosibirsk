from datetime import datetime

from pydantic import BaseModel
from typing import Literal


class StudentCertificateOut(BaseModel):
    id: int
    student_id: int
    course_id: int
    issued_by: int | None = None
    issued_at: datetime | None = None
    certificate_url: str
    certificate_status: str

    model_config = {"from_attributes": True}


class TeacherCertificateOut(BaseModel):
    id: int
    user_id: int
    course_id: int
    issued_by: int | None = None
    issued_at: datetime | None = None
    certificate_url: str
    certificate_status: str

    model_config = {"from_attributes": True}


class CertificateDownloadOut(BaseModel):
    download_url: str


class CertificatePresignUploadIn(BaseModel):
    owner_type: Literal["students", "teachers"]
    owner_id: int
    course_id: int
    filename: str
    content_type: str | None = None


class CertificatePresignUploadOut(BaseModel):
    upload_url: str
    object_key: str
