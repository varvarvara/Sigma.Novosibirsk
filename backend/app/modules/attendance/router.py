from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.attendance.schemas import (
    AttendanceBulkMarkIn,
    AttendanceBulkMarkOut,
    AttendanceMarkIn,
    AttendanceMarkOut,
    CourseAttendanceSummaryOut,
    CourseStudentAttendanceDetailOut,
    StudentAttendanceDashboardOut,
    StudentSearchItemOut,
)
from app.modules.attendance.service import AttendanceService
from app.security.permissions import require_student, require_teacher_or_admin
from app.security.permissions import require_teacher_or_admin
from app.modules.attendance.schemas import AchievementCreate, AchievementOut
from app.modules.attendance.service import AchievementService

attendanceRouter = APIRouter(prefix="/attendance", tags=["attendance"])
achievementRouter = APIRouter(prefix="/achievements", tags=["achievements"])

@attendanceRouter.post("/mark", response_model=AttendanceMarkOut)
def mark_attendance(
    body: AttendanceMarkIn,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return AttendanceService(db=db).mark_attendance(data=body, current_user=current_user)


@attendanceRouter.post("/schedules/{schedule_id}/mark-bulk", response_model=AttendanceBulkMarkOut)
def bulk_mark_attendance(
    schedule_id: int,
    body: AttendanceBulkMarkIn,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return AttendanceService(db=db).bulk_mark_attendance(
        schedule_id=schedule_id,
        data=body,
        current_user=current_user,
    )


@attendanceRouter.get("/courses/{course_id}/summary", response_model=CourseAttendanceSummaryOut)
def get_course_attendance_summary(
    course_id: int,
    q: str | None = Query(default=None, description="Search by student first/last name or email"),
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return AttendanceService(db=db).get_course_summary(course_id=course_id, current_user=current_user, search=q)


@attendanceRouter.get("/courses/{course_id}/students/{student_id}", response_model=CourseStudentAttendanceDetailOut)
def get_course_student_attendance(
    course_id: int,
    student_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return AttendanceService(db=db).get_course_student_detail(
        course_id=course_id,
        student_id=student_id,
        current_user=current_user,
    )


@attendanceRouter.get("/students/search", response_model=list[StudentSearchItemOut])
def search_students_for_attendance(
    q: str = Query(min_length=2, description="Search query"),
    course_id: int | None = Query(default=None),
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return AttendanceService(db=db).search_students(
        query_value=q,
        current_user=current_user,
        course_id=course_id,
    )


@attendanceRouter.get("/me", response_model=StudentAttendanceDashboardOut)
def get_my_attendance(
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    return AttendanceService(db=db).get_my_attendance(current_user=current_user)

@achievementRouter.post("/", response_model=AchievementOut)
def create_achievement(
    body: AchievementCreate,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return AchievementService(db).create_achievement(body, current_user)

@achievementRouter.get("/course/{course_id}", response_model=list[AchievementOut])
def get_course_achievements(
    course_id: int,
    db: Session = Depends(get_db),
):
    return AchievementService(db).get_course_achievements(course_id)


