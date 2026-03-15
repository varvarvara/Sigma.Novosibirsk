from sqlalchemy.orm import Session
from .models import Course, Staff

class CourseRepository:
    def __init__(self,db: Session):
        self.db = db
        
    def get_by_id(self, course_id: int):
        return (
            self.db.query(Course)
            .filter(Course.id == course_id)
            .first()
        )
        
    def get_by_title(self, title: str):
        return (
            self.db.query(Course)
            .filter(Course.title == title)
            .all()
        )
        
    def get_syllabus(db: Session, course_id: int = None, course_title: str = None):
        query = db.query(Course)

        if course_id:
            query = query.filter(Course.id == course_id)
        elif course_title:
            query = query.filter(Course.title == course_title)

        course = query.first()
        if course:
            return course.syllabus_url
        return f"Курс не найден!"
    
    
    def get_description_by_title(db: Session, course_title: str):
        query = db.query(Course)
        query =  query.filter(Course.title == course_title)
        course = query.first()
        
        if course is None:
            return f"Курс не найден!"
        else:
            return course.description 
        
        
    def get_descripton_by_id(db: Session, course_id: int):
        query = db.query(Course)
        query =  query.filter(Course.id == course_id)
        course = query.first()
        
        if course is None:
            return f"Курс не найден!"
        else:
            return course.description
        
        
    def get_teacher_name_by_course_id_or_title(db: Session, course_id: int = None, course_title: str = None):
        query = db.query(Course).join(Staff)

        if course_id:
            query = query.filter(Course.id == course_id)
        elif course_title:
            query = query.filter(Course.title == course_title)

        course = query.first()

        if course and course.staff:
            return {"first_name": course.staff.first_name, "last_name": course.staff.last_name}
    
        return None 
    
    def get_teacher_by_course(self, course_id: int = None, course_title: str = None):

        query = (
        self.db.query(Staff.first_name, Staff.last_name)
        .join(Course, Course.staff_id == Staff.id)
        )

        if course_id:
            query = query.filter(Course.id == course_id)

        elif course_title:
            query = query.filter(Course.title == course_title)

        teacher = query.first()

        if not teacher:
            return "Преподаватель не найден!"

        return {
            "first_name": teacher.first_name,
            "last_name": teacher.last_name
        }
    
    
    def create_course(self, title: str, description: str, staff_id: int, course_status: str, syllabus_url: str):
        db_course = Course(
            title=title,
            description=description,
            staff_id=staff_id,
            course_status=course_status,
            syllabus_url=syllabus_url
        )
        self.db.add(db_course)
        self.db.commit()
        self.db.refresh(db_course)
        return db_course
    
    def get_all(self):
        return self.db.query(Course).all()
    
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
        
       
        