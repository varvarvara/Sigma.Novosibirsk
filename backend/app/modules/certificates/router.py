from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.certificates.schemas import (
    CertificatePresignUploadIn,
    CertificatePresignUploadOut,
    CertificateDownloadOut,
    StudentCertificateOut,
    TeacherCertificateOut,
)
from app.modules.certificates.service import CertificatesAppService
from app.security.dependecies import get_current_user
from app.security.permissions import require_admin, require_student, require_teacher, require_teacher_or_admin


certificatesRouter = APIRouter(prefix="/certificates", tags=["certificates"])


def get_certificates_service(db: Session = Depends(get_db)) -> CertificatesAppService:
    return CertificatesAppService(db=db)


@certificatesRouter.post("/students/upload", response_model=StudentCertificateOut, status_code=201)
def upload_student_certificate(
    student_id: int = Form(...),
    course_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(require_teacher_or_admin),
    service: CertificatesAppService = Depends(get_certificates_service),
):
    return service.upload_student_certificate(
        file=file,
        student_id=student_id,
        course_id=course_id,
        current_user=current_user,
    )


@certificatesRouter.post("/presign-upload", response_model=CertificatePresignUploadOut)
def presign_certificate_upload(
    body: CertificatePresignUploadIn,
    current_user: dict = Depends(require_teacher_or_admin),
    service: CertificatesAppService = Depends(get_certificates_service),
):
    result = service.create_presigned_upload(data=body, current_user=current_user)
    return CertificatePresignUploadOut(
        upload_url=result["upload_url"],
        object_key=result["object_key"],
    )


@certificatesRouter.post("/teachers/upload", response_model=TeacherCertificateOut, status_code=201)
def upload_teacher_certificate(
    user_id: int = Form(...),
    course_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(require_admin),
    service: CertificatesAppService = Depends(get_certificates_service),
):
    return service.upload_teacher_certificate(
        file=file,
        user_id=user_id,
        course_id=course_id,
        current_user=current_user,
    )


@certificatesRouter.get("/students/my", response_model=list[StudentCertificateOut])
def get_my_student_certificates(
    current_user: dict = Depends(require_student),
    service: CertificatesAppService = Depends(get_certificates_service),
):
    return service.list_my_student_certificates(current_user=current_user)


@certificatesRouter.get("/teachers/my", response_model=list[TeacherCertificateOut])
def get_my_teacher_certificates(
    current_user: dict = Depends(require_teacher),
    service: CertificatesAppService = Depends(get_certificates_service),
):
    return service.list_my_teacher_certificates(current_user=current_user)


@certificatesRouter.get("/students/{certificate_id}/download", response_model=CertificateDownloadOut)
def get_student_certificate_download(
    certificate_id: int,
    current_user: dict = Depends(get_current_user),
    service: CertificatesAppService = Depends(get_certificates_service),
):
    return CertificateDownloadOut(
        download_url=service.get_student_certificate_download_url(
            certificate_id=certificate_id,
            current_user=current_user,
        )
    )


@certificatesRouter.get("/teachers/{certificate_id}/download", response_model=CertificateDownloadOut)
def get_teacher_certificate_download(
    certificate_id: int,
    current_user: dict = Depends(get_current_user),
    service: CertificatesAppService = Depends(get_certificates_service),
):
    return CertificateDownloadOut(
        download_url=service.get_teacher_certificate_download_url(
            certificate_id=certificate_id,
            current_user=current_user,
        )
    )
