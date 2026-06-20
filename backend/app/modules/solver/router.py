from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import defaultdict

from app.db.session import get_db
from app.modules.solver.algorithm import generate_schedule
from app.modules.courses.repository import CourseRepository
from app.modules.enrollment.repository import EnrollmentRepository
from app.modules.scheduling.models import Slot


schedulingmakerRouter = APIRouter(
    prefix="/schedulingmaker",
    tags=["schedulingmaker"]
)

def format_schedule_by_courses(raw_schedule, course_classes, courses, slots):
    cc_map = {cc.id: cc for cc in course_classes}
    course_map = {c.id: c for c in courses}
    slot_map = {s.id: s for s in slots}

    result = defaultdict(lambda: {
        "course": "",
        "teacher": "",
        "schedule": []
    })

    for item in raw_schedule:
        cc = cc_map[item["course_class_id"]]
        course = course_map[cc.course_id]
        slot = slot_map[item["slot_id"]]

        course_entry = result[course.id]

        course_entry["course"] = course.title
        course_entry["teacher"] = f"{course.staff.first_name} {course.staff.last_name}"

        course_entry["schedule"].append({
            "day": str(slot.slot_date),
            "time": str(slot.slot_time)[:5],
            "class_number": cc.class_number
        })

    for course_id in result:
        result[course_id]["schedule"].sort(
            key=lambda x: (x["day"], x["time"])
        )

    return list(result.values())

@schedulingmakerRouter.post("/generate-schedule")
def generate(
    season_id: int = Query(1, description="ID сезона"),
    db: Session = Depends(get_db)
):
    course_repo = CourseRepository(db)
    enrollment_repo = EnrollmentRepository(db)

    courses = course_repo.get_all()
    course_classes = course_repo.get_course_classes()
    enrollments = enrollment_repo.get_enrollment_by_season(season_id=season_id)
    slots = db.query(Slot).all()

    solver_result = generate_schedule(
        courses=courses,
        course_classes=course_classes,
        slots=slots,
        enrollments=enrollments
    )

    if solver_result["status"] not in ["OPTIMAL", "FEASIBLE"]:
        return solver_result

    formatted = format_schedule_by_courses(
        solver_result["schedule"],
        course_classes,
        courses,
        slots
    )

    return {
        "status": solver_result["status"],
        "schedule_by_courses": formatted
    }