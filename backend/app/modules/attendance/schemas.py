from datetime import date, time

from pydantic import BaseModel, Field


class AttendanceMarkIn(BaseModel):
    student_id: int = Field(gt=0)
    schedule_id: int = Field(gt=0)
    attendance_status: bool
    season_id: int = Field(gt=0)


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


class StudentAttendanceFilterCourseOut(BaseModel):
    course_id: int
    course_title: str
    teacher_name: str


class StudentAttendanceFilterOptionsOut(BaseModel):
    courses: list[StudentAttendanceFilterCourseOut]
    dates: list[date]


class StudentAttendanceChargeOut(BaseModel):
    schedule_id: int
    course_id: int
    course_title: str
    teacher_name: str
    lesson_date: date
    points: int
    attended: bool

class AchievementAssign(BaseModel):
    student_id: int
    achievement_id: int


class AchievementCreate(BaseModel):
    achievement_name: str = Field(min_length=1, max_length=50)
    achievement_description: str = Field(min_length=1, max_length=100)
    course_id: int = Field(gt=0)
    achievement_score: int = Field(ge=0)
    season_id: int = Field(gt=0)

class StudentCourseAchievementOut(BaseModel):
    course_id: int
    achievement_name: str
        
class AchievementOut(BaseModel):
    id: int
    achievement_name: str
    achievement_description: str
    course_id: int
    achievement_score: int
    season_id: int
    icon_image_key: str | None = None
    icon_url: str | None = None

    class Config:
        from_attributes = True


class CourseAchievementStateOut(BaseModel):
    achievement_id: int
    assigned: bool
    student_achievement_id: int | None = None


class CourseAchievementStudentOut(BaseModel):
    student_id: int
    first_name: str
    last_name: str
    email: str
    achievements: list[CourseAchievementStateOut]


class CourseAchievementMatrixOut(BaseModel):
    course_id: int
    course_title: str
    staff_id: int
    teacher_name: str
    achievements: list[AchievementOut]
    students: list[CourseAchievementStudentOut]

from datetime import datetime
from pydantic import BaseModel


class StudentAchievementOut(BaseModel):
    id: int
    student_id: int
    achievement_id: int
    awarded_at: datetime
    season_id: int

    class Config:
        from_attributes = True


class StudentAchievementDetailedOut(BaseModel):
    id: int
    student_id: int
    achievement_id: int
    awarded_at: datetime
    season_id: int
    course_id: int
    course_title: str
    achievement_name: str
    achievement_description: str
    achievement_score: int
    icon_image_key: str | None = None
    icon_url: str | None = None
