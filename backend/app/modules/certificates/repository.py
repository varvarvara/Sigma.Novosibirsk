from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.attendance.models import StudentCertificate
from app.modules.courses.models import Course
from app.modules.users.models import Staff, Student, TeacherCertificate


class CertificatesRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_course_by_id(self, course_id: int) -> Course | None:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def get_student_by_id(self, student_id: int) -> Student | None:
        return self.db.query(Student).filter(Student.id == student_id).first()

    def get_staff_by_id(self, staff_id: int) -> Staff | None:
        return self.db.query(Staff).filter(Staff.id == staff_id).first()

    def is_teacher_course_owner(self, course_id: int, teacher_id: int) -> bool:
        row = self.db.query(Course.id).filter(Course.id == course_id, Course.staff_id == teacher_id).first()
        return row is not None

    def save_student_certificate(
        self,
        student_id: int,
        course_id: int,
        issued_by: int | None,
        certificate_url: str,
    ) -> StudentCertificate:
        certificate = (
            self.db.query(StudentCertificate)
            .filter(StudentCertificate.student_id == student_id, StudentCertificate.course_id == course_id)
            .first()
        )

        if certificate is None:
            certificate = StudentCertificate(
                student_id=student_id,
                course_id=course_id,
                issued_by=issued_by,
                certificate_url=certificate_url,
                certificate_status="Issued",
            )
            self.db.add(certificate)
        else:
            certificate.issued_by = issued_by
            certificate.issued_at = datetime.utcnow()
            certificate.certificate_url = certificate_url
            certificate.certificate_status = "Issued"

        self.db.commit()
        self.db.refresh(certificate)
        return certificate

    def save_teacher_certificate(
        self,
        user_id: int,
        course_id: int,
        issued_by: int | None,
        certificate_url: str,
    ) -> TeacherCertificate:
        certificate = (
            self.db.query(TeacherCertificate)
            .filter(TeacherCertificate.user_id == user_id, TeacherCertificate.course_id == course_id)
            .first()
        )

        if certificate is None:
            certificate = TeacherCertificate(
                user_id=user_id,
                course_id=course_id,
                issued_by=issued_by,
                certificate_url=certificate_url,
                certificate_status="Issued",
            )
            self.db.add(certificate)
        else:
            certificate.issued_by = issued_by
            certificate.issued_at = datetime.utcnow()
            certificate.certificate_url = certificate_url
            certificate.certificate_status = "Issued"

        self.db.commit()
        self.db.refresh(certificate)
        return certificate

    def get_student_certificate_by_id(self, certificate_id: int) -> StudentCertificate | None:
        return self.db.query(StudentCertificate).filter(StudentCertificate.id == certificate_id).first()

    def get_teacher_certificate_by_id(self, certificate_id: int) -> TeacherCertificate | None:
        return self.db.query(TeacherCertificate).filter(TeacherCertificate.id == certificate_id).first()

    def list_student_certificates(self, student_id: int) -> list[StudentCertificate]:
        return (
            self.db.query(StudentCertificate)
            .filter(StudentCertificate.student_id == student_id)
            .order_by(StudentCertificate.id.desc())
            .all()
        )

    def list_teacher_certificates(self, teacher_id: int) -> list[TeacherCertificate]:
        return (
            self.db.query(TeacherCertificate)
            .filter(TeacherCertificate.user_id == teacher_id)
            .order_by(TeacherCertificate.id.desc())
            .all()
        )
