from sqlalchemy.orm import Session
from .models import Enrollment

class EnrollmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_enrollments(self, skip: int = 0, limit: int = 100):
        return self.db.query(Enrollment).offset(skip).limit(limit).all()


    def get_enrollment_by_id(self, enrollment_id: int):
        return self.db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()


    def get_enrollments_by_student_id(self, student_id: int):
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.student_id == student_id)
        .all()
    )
    
    def get_enrollments_by_course_id(self, course_id: int):
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.course_id == course_id)
            .all()
    )

    def create_enrollment(self, student_id: int, course_id: int):
        db_enrollment = Enrollment(student_id=student_id, course_id=course_id, enrollment_status="Active")
        self.db.add(db_enrollment)
        self.db.commit()
        self.db.refresh(db_enrollment)
        return db_enrollment

    def update_enrollment_status(self, enrollment_id: int, new_status: str):
        db_enrollment = self.db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
        if db_enrollment:
            db_enrollment.enrollment_status = new_status
            self.db.commit()
            self.db.refresh(db_enrollment)
        return db_enrollment


    def delete_enrollment(self, enrollment_id: int):
        db_enrollment = self.db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
        if db_enrollment:
            self.db.delete(db_enrollment)
            self.db.commit()
        return db_enrollment