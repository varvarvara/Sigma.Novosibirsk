from datetime import date, time

from pydantic import BaseModel, Field


class AttendanceMarkIn(BaseModel):
    student_id: int = Field(gt=0)
    schedule_id: int = Field(gt=0)
    attendance_status: bool


class AttendanceBulkMarkItemIn(BaseModel):
    student_id: int = Field(gt=0)
    attendance_status: bool


class AttendanceBulkMarkIn(BaseModel):
    items: list[AttendanceBulkMarkItemIn]


class AttendanceMarkOut(BaseModel):
    attendance_id: int
    student_id: int
    schedule_id: int
    attendance_status: bool
    attendance_points: int
    created: bool


class AttendanceBulkMarkOut(BaseModel):
    schedule_id: int
    updated_count: int
    results: list[AttendanceMarkOut]


class CourseStudentAttendanceSummaryOut(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    email: str
    attended_lessons: int
    total_lessons: int
    attendance_percent: float


class CourseAttendanceSummaryOut(BaseModel):
    course_id: int
    course_title: str
    staff_id: int
    teacher_name: str
    students: list[CourseStudentAttendanceSummaryOut]


class LessonAttendanceItemOut(BaseModel):
    schedule_id: int
    lesson_date: date
    lesson_time: time
    attendance_status: bool | None = None


class CourseStudentAttendanceDetailOut(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    email: str
    course_id: int
    course_title: str
    attended_lessons: int
    total_lessons: int
    attendance_percent: float
    attendance_points: int
    lessons: list[LessonAttendanceItemOut]


class StudentSearchItemOut(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    email: str


class StudentCourseAttendanceOut(BaseModel):
    course_id: int
    course_title: str
    attended_lessons: int
    total_lessons: int
    attendance_percent: float


class StudentAttendanceDashboardOut(BaseModel):
    student_id: int
    attendance_points: int
    total_attended_lessons: int
    total_lessons: int
    courses: list[StudentCourseAttendanceOut]
