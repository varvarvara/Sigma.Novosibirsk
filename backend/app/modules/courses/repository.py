from sqlalchemy.orm import Session

from app.modules.courses.models import Course
from app.modules.users.models import Staff


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, course_id: int) -> Course | None:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def get_all(self) -> list[Course]:
        return self.db.query(Course).order_by(Course.id.desc()).all()

    def get_all_published(self) -> list[Course]:
        return (
            self.db.query(Course)
            .filter(Course.course_status == "Published")
            .order_by(Course.id.desc())
            .all()
        )

    def get_all_by_staff(self, staff_id: int) -> list[Course]:
        return (
            self.db.query(Course)
            .filter(Course.staff_id == staff_id)
            .order_by(Course.id.desc())
            .all()
        )

    def get_staff_by_id(self, staff_id: int) -> Staff | None:
        return self.db.query(Staff).filter(Staff.id == staff_id).first()

    def create_course(
        self,
        title: str,
        description: str,
        staff_id: int,
        course_status: str,
        syllabus_url: str,
    ) -> Course:
        db_course = Course(
            title=title,
            descriptions=description,
            staff_id=staff_id,
            course_status=course_status,
            syllabus_url=syllabus_url,
        )
        self.db.add(db_course)
        self.db.commit()
        self.db.refresh(db_course)
        return db_course
    
    def update_course_status_by_id(self, course_id: int, new_status: str):
        db_course= self.db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return f"Курс не найден!"
        db_course.course_status = new_status
        self.db.commit()
        self.db.refresh(db_course)
        
        return db_course
        
    def delete_course_by_id(self, course_id: int):
        db_course=self.db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return f"Курс не найден!"
        self.db.delete(db_course)
        self.db.commit()
        self.db.refresh(db_course)
        
        return f"Курс с id {course_id} успешно удалён!"
        
       
        
    def update_course(self, course: Course, **fields) -> Course:
        for key, value in fields.items():
            setattr(course, key, value)

        self.db.commit()
        self.db.refresh(course)
        return course

    def delete_course(self, course: Course) -> None:
        self.db.delete(course)
        self.db.commit()
