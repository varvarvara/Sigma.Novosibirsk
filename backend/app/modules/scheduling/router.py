from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.scheduling.schemas import (
    GlobalScheduleGenerateIn,
    GlobalScheduleGenerateOut,
    TimetableItemOut,
)
from app.modules.scheduling.services import SchedulingService
from app.security.dependecies import get_current_user
from app.security.permissions import require_admin, require_teacher_or_admin

schedulingRouter = APIRouter(prefix="/scheduling", tags=["scheduling"])

@schedulingRouter.post("/generate-global", response_model=GlobalScheduleGenerateOut)
def generate_global_schedule(
    body: GlobalScheduleGenerateIn,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return SchedulingService(db=db).generate_global_schedule(
        data=body,
        current_user=current_user,
    )

@schedulingRouter.post("/generate-preview")
def generate_schedule_preview(
    season_id: int = Query(1, description="ID сезона"),
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return SchedulingService(db=db).generate_preview(
        season_id=season_id,
        current_user=current_user,
    )


@schedulingRouter.get("/preview/{generation_id}")
def get_schedule_preview(
    generation_id: int,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return SchedulingService(db=db).get_preview(
        generation_id=generation_id,
        current_user=current_user,
    )


@schedulingRouter.post("/approve-preview/{generation_id}")
def approve_schedule_preview(
    generation_id: int,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return SchedulingService(db=db).approve_preview(
        generation_id=generation_id,
        current_user=current_user,
    )


@schedulingRouter.get("/events")
def get_schedule_events(
    season_id: int = Query(1, description="ID сезона"),
    teacher_id: int | None = Query(None, description="ID преподавателя"),
    course_id: int | None = Query(None, description="ID курса"),
    student_id: int | None = Query(None, description="ID студента"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return SchedulingService(db=db).get_events(
        season_id=season_id,
        teacher_id=teacher_id,
        course_id=course_id,
        student_id=student_id,
        current_user=current_user,
    )


@schedulingRouter.get("/events/export.ics")
def export_schedule_events_ics(
    season_id: int = Query(1, description="ID сезона"),
    teacher_id: int | None = Query(None, description="ID преподавателя"),
    course_id: int | None = Query(None, description="ID курса"),
    student_id: int | None = Query(None, description="ID студента"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content, filename = SchedulingService(db=db).export_events_ics(
        season_id=season_id,
        teacher_id=teacher_id,
        course_id=course_id,
        student_id=student_id,
        current_user=current_user,
    )

    return Response(
        content=content,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@schedulingRouter.get("/timetable", response_model=list[TimetableItemOut])
def get_timetable(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return SchedulingService(db=db).get_timetable(current_user=current_user)


@schedulingRouter.get("/timetable/teachers/{staff_id}", response_model=list[TimetableItemOut])
def get_teacher_timetable(
    staff_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    return SchedulingService(db=db).get_teacher_timetable(
        staff_id=staff_id,
        current_user=current_user,
    )


@schedulingRouter.get("/timetable/teachers/{staff_id}/export.ics")
def export_teacher_timetable_ics(
    staff_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    content, filename = SchedulingService(db=db).export_teacher_timetable_ics(
        staff_id=staff_id,
        current_user=current_user,
    )

    return Response(
        content=content,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@schedulingRouter.get("/timetable/teachers/{staff_id}/export.csv")
def export_teacher_timetable_csv(
    staff_id: int,
    current_user: dict = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    content, filename = SchedulingService(db=db).export_teacher_timetable_csv(
        staff_id=staff_id,
        current_user=current_user,
    )

    return Response(
        content=content,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
    
