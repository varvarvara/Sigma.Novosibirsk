from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError, DBAPIError
from sqlalchemy import and_
from sqlalchemy import select
from models import Achievement, StudentAchievement, StudentCertificate, Students, Course, Attendance#, Schedule
from enums import CertificateStatuses

class AttendanceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, student_id: int, schedule_id: int, status: bool):
        obj = Attendance(
            student_id=student_id,
            schedule_id=schedule_id,
            attendance_status=status
        )

        self.db.add(obj)

        try:
            self.db.commit()
            self.db.refresh(obj)
            return obj

        except IntegrityError:
            self.db.rollback()
            raise ValueError(
                "Запись посещаемости уже существует для этого студента и занятия"
            )
            
    def exists(self, student_id: int, schedule_id: int) -> bool:
        return (
            self.db.query(Attendance.id)
            .filter(
                Attendance.student_id == student_id,
                Attendance.schedule_id == schedule_id
            )
            .first()
            is not None
        )
        
    def get_by_student_and_schedule(self, student_id: int, schedule_id: int):
        return (
            self.db.query(Attendance)
            .filter(
                Attendance.student_id == student_id,
                Attendance.schedule_id == schedule_id
            )
            .first()
        )
        
    def update_status(self, student_id: int, schedule_id: int, new_status: bool):
        obj = self.get_by_student_and_schedule(student_id, schedule_id)

        if not obj:
            return None

        obj.attendance_status = new_status

        self.db.commit()
        self.db.refresh(obj)
        return obj
    
    def delete(self, student_id: int, schedule_id: int):
        obj = self.get_by_student_and_schedule(student_id, schedule_id)

        if not obj:
            return False

        self.db.delete(obj)
        self.db.commit()
        return True
    
    def get_by_student(self, student_id: int):
        results = (
            self.db.query(
                Attendance.schedule_id,
                Attendance.attendance_status,
                Schedule.lesson_date,
                Schedule.lesson_time
            )
            .join(Schedule, Attendance.schedule_id == Schedule.id)
            .filter(Attendance.student_id == student_id)
            .all()
        )

        return [
            {
                "schedule_id": r.schedule_id,
                "lesson_date": r.lesson_date,
                "lesson_time": r.lesson_time,
                "attendance_status": r.attendance_status
            }
            for r in results
        ]
        
    def get_by_schedule(self, schedule_id: int):
        results = (
            self.db.query(
                Students.id,
                Students.first_name,
                Students.last_name,
                Attendance.attendance_status,
                Schedule.lesson_date,
                Schedule.lesson_time
            )
            .join(Attendance, Attendance.student_id == Students.id)
            .join(Schedule, Attendance.schedule_id == Schedule.id)
            .filter(Attendance.schedule_id == schedule_id)
            .all()
        )

        return [
            {
                "student_id": r.id,
                "first_name": r.first_name,
                "last_name": r.last_name,
                "attendance_status": r.attendance_status,
                "lesson_date": r.lesson_date,
                "lesson_time": r.lesson_time
            }
            for r in results
        ]
class AchievementRepository:

    def __init__(self, db: Session):
        self.db = db
        
    def create_achievement(self, description: str, score: int):
        achievement = Achievement(
            achievement_description=description,
            achievement_score=score
        )
        self.db.add(achievement)
        self.db.commit()
        self.db.refresh(achievement)
        return achievement
    
    def get_all_achievements(self):
        return self.db.query(Achievement).all()

    def assign_achievement_to_student(
        self,
        student_id: int,
        achievement_id: int,
        course_id: int
    ):
        obj = StudentAchievement(
            student_id=student_id,
            achievement_id=achievement_id,
            course_id=course_id
        )

        self.db.add(obj)

        try:
            self.db.commit()
            self.db.refresh(obj)
            return obj

        except IntegrityError:
            self.db.rollback()
            raise ValueError(
                "Эта ачивка уже назначена студенту на этом курсе"
            )
            
    def get_student_achievements(self, student_id: int):
        results = (
            self.db.query(
                Achievement.id,
                Achievement.achievement_description,
                Achievement.achievement_score,
                Course.id.label("course_id"),
                Course.title,
                StudentAchievement.awarded_at
            )
            .join(StudentAchievement, StudentAchievement.achievement_id == Achievement.id)
            .join(Course, StudentAchievement.course_id == Course.id)
            .filter(StudentAchievement.student_id == student_id)
            .all()
        )

        return [
            {
                "achievement_id": r.id,
                "description": r.achievement_description,
                "score": r.achievement_score,
                "course_id": r.course_id,
                "course_title": r.title,
                "awarded_at": r.awarded_at
            }
            for r in results
        ] 
        
    def get_student_achievements_by_course(
        self,
        student_id: int,
        course_id: int
    ):
        return (
            self.db.query(
                Achievement.achievement_description,
                Achievement.achievement_score,
                StudentAchievement.awarded_at
            )
            .join(StudentAchievement)
            .filter(
                StudentAchievement.student_id == student_id,
                StudentAchievement.course_id == course_id
            )
            .all()
        )
        
    def get_students_by_achievement(self, achievement_id: int):
        return (
            self.db.query(
                Students.id,
                Students.first_name,
                Students.last_name,
                Course.title
            )
            .join(StudentAchievement, StudentAchievement.student_id == Students.id)
            .join(Course, StudentAchievement.course_id == Course.id)
            .filter(StudentAchievement.achievement_id == achievement_id)
            .all()
        )
        
    def remove_achievement_from_student(
        self,
        student_id: int,
        achievement_id: int,
        course_id: int
    ):
        obj = (
            self.db.query(StudentAchievement)
            .filter(
                and_(
                    StudentAchievement.student_id == student_id,
                    StudentAchievement.achievement_id == achievement_id,
                    StudentAchievement.course_id == course_id
                )
            )
            .first()
        )

        if not obj:
            return False

        self.db.delete(obj)
        self.db.commit()
        return True
    
    def remove_achievement_from_student(
        self,
        student_id: int,
        achievement_id: int,
        course_id: int
    ):
        obj = (
            self.db.query(StudentAchievement)
            .filter(
                and_(
                    StudentAchievement.student_id == student_id,
                    StudentAchievement.achievement_id == achievement_id,
                    StudentAchievement.course_id == course_id
                )
            )
            .first()
        )

        if not obj:
            return False

        self.db.delete(obj)
        self.db.commit()
        return True
    
class StudentAchievementRepository:

    def __init__(self, db: Session):
        self.db = db
        
    def create(
        self,
        student_id: int,
        achievement_id: int,
        course_id: int
    ):
        obj = StudentAchievement(
            student_id=student_id,
            achievement_id=achievement_id,
            course_id=course_id
        )

        self.db.add(obj)

        try:
            self.db.commit()
            self.db.refresh(obj)
            return obj

        except IntegrityError:
            self.db.rollback()
            raise ValueError(
                "Ачивка уже выдана студенту на этом курсе"
            )
            
    def get_by_student(self, student_id: int):
        results = (
            self.db.query(
                Achievement.id,
                Achievement.achievement_description,
                Achievement.achievement_score,
                Course.id.label("course_id"),
                Course.title,
                StudentAchievement.awarded_at
            )
            .join(StudentAchievement, StudentAchievement.achievement_id == Achievement.id)
            .join(Course, StudentAchievement.course_id == Course.id)
            .filter(StudentAchievement.student_id == student_id)
            .all()
        )

        return [
            {
                "achievement_id": r.id,
                "description": r.achievement_description,
                "score": r.achievement_score,
                "course_id": r.course_id,
                "course_title": r.title,
                "awarded_at": r.awarded_at
            }
            for r in results
        ]
    def get_by_student_and_course(
        self,
        student_id: int,
        course_id: int
    ):
        return (
            self.db.query(
                Achievement.achievement_description,
                Achievement.achievement_score,
                StudentAchievement.awarded_at
            )
            .join(StudentAchievement)
            .filter(
                StudentAchievement.student_id == student_id,
                StudentAchievement.course_id == course_id
            )
            .all()
        )
        
    def exists(
        self,
        student_id: int,
        achievement_id: int,
        course_id: int
    ) -> bool:
        return (
            self.db.query(StudentAchievement.id)
            .filter(
                StudentAchievement.student_id == student_id,
                StudentAchievement.achievement_id == achievement_id,
                StudentAchievement.course_id == course_id
            )
            .first()
            is not None
        )
        
    def delete(
        self,
        student_id: int,
        achievement_id: int,
        course_id: int
    ):
        obj = (
            self.db.query(StudentAchievement)
            .filter(
                StudentAchievement.student_id == student_id,
                StudentAchievement.achievement_id == achievement_id,
                StudentAchievement.course_id == course_id
            )
            .first()
        )

        if not obj:
            return False

        self.db.delete(obj)
        self.db.commit()
        return True
    
    def get_students_by_achievement(self, achievement_id: int):
        return (
            self.db.query(
                Students.id,
                Students.first_name,
                Students.last_name,
                Course.title
            )
            .join(StudentAchievement, StudentAchievement.student_id == Students.id)
            .join(Course, StudentAchievement.course_id == Course.id)
            .filter(StudentAchievement.achievement_id == achievement_id)
            .all()
        )
        
class StudentCertificateRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        student_id: int,
        course_id: int,
        issued_by: int | None = None,
        certificate_url: str | None = None,
        certificate_status: CertificateStatuses = CertificateStatuses.IN_PROGRESS
    ):
        certificate = StudentCertificate(
            student_id=student_id,
            course_id=course_id,
            issued_by=issued_by,
            certificate_url=certificate_url,
            certificate_status=certificate_status
        )

        self.db.add(certificate)

        try:
            self.db.commit()
            self.db.refresh(certificate)
            return certificate

        except IntegrityError:
            self.db.rollback()
            raise ValueError(
                "Сертификат для этого студента по этому курсу уже существует"
            )

        except DBAPIError as e:
            self.db.rollback()
            raise ValueError(
                f"Ошибка базы данных при создании сертификата: {str(e)}"
            )

    def get_by_id(self, certificate_id: int):
        return (
            self.db.query(StudentCertificate)
            .filter(StudentCertificate.id == certificate_id)
            .first()
        )

    def get_by_student(self, student_id: int):
        results = (
            self.db.query(
                StudentCertificate.id,
                StudentCertificate.student_id,
                StudentCertificate.course_id,
                Course.title,
                StudentCertificate.certificate_url,
                StudentCertificate.certificate_status,
                StudentCertificate.issued_at
            )
            .join(Course, StudentCertificate.course_id == Course.id)
            .filter(StudentCertificate.student_id == student_id)
            .all()
        )

        return [
            {
                "certificate_id": r.id,
                "student_id": r.student_id,
                "course_id": r.course_id,
                "course_title": r.title,
                "certificate_url": r.certificate_url,
                "certificate_status": r.certificate_status,
                "issued_at": r.issued_at
            }
            for r in results
        ]

    def get_by_student_and_course(self, student_id: int, course_id: int):
        return (
            self.db.query(StudentCertificate)
            .filter(
                StudentCertificate.student_id == student_id,
                StudentCertificate.course_id == course_id
            )
            .first()
        )

    def exists(self, student_id: int, course_id: int) -> bool:
        return (
            self.db.query(StudentCertificate.id)
            .filter(
                StudentCertificate.student_id == student_id,
                StudentCertificate.course_id == course_id
            )
            .first()
            is not None
        )

    def update_status(
        self,
        student_id: int,
        course_id: int,
        new_status: CertificateStatuses
    ):
        certificate = self.get_by_student_and_course(student_id, course_id)

        if not certificate:
            return None

        certificate.certificate_status = new_status

        try:
            self.db.commit()
            self.db.refresh(certificate)
            return certificate

        except DBAPIError as e:
            self.db.rollback()
            raise ValueError(
                f"Не удалось изменить статус сертификата: {str(e)}"
            )

    def update_url(
        self,
        student_id: int,
        course_id: int,
        new_url: str
    ):
        certificate = self.get_by_student_and_course(student_id, course_id)

        if not certificate:
            return None

        certificate.certificate_url = new_url

        try:
            self.db.commit()
            self.db.refresh(certificate)
            return certificate

        except DBAPIError as e:
            self.db.rollback()
            raise ValueError(
                f"Не удалось изменить URL сертификата: {str(e)}"
            )

    def delete(self, student_id: int, course_id: int):
        certificate = self.get_by_student_and_course(student_id, course_id)

        if not certificate:
            return False

        self.db.delete(certificate)
        self.db.commit()
        return True