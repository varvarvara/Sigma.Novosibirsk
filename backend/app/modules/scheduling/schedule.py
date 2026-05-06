from datetime import date, time, timedelta

from fastapi import HTTPException, status

from app.modules.scheduling.repository import SchedulingRepository
from app.modules.scheduling.schemas import CourseScheduleGenerateIn


COURSE_DURATION_TO_DAYS = {
    "ThreeDays": 3,
    "SixDays": 6,
}

WEEKDAY_TO_INT = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}

ALLOWED_SLOT_HOURS = {9, 10, 11, 12}


def required_lessons_for_course(course_duration) -> int:
    course_duration_value = course_duration.value if hasattr(course_duration, "value") else str(course_duration)
    return COURSE_DURATION_TO_DAYS.get(course_duration_value, 3)


def generate_schedule_by_weekdays(
    repository: SchedulingRepository,
    course,
    course_id: int,
    data: CourseScheduleGenerateIn,
    required_lessons: int,
    existing_lessons: int,
    allow_subject_conflicts: bool = False,
) -> list:
    to_generate = required_lessons - existing_lessons
    if to_generate <= 0:
        return []

    allowed_weekdays = {WEEKDAY_TO_INT[weekday.value] for weekday in data.weekdays}
    preferred_slots = sorted(set(data.preferred_slots))

    generated = []
    cursor = data.start_date
    max_cursor_date = data.start_date + timedelta(days=180)

    while len(generated) < to_generate and cursor <= max_cursor_date:
        if cursor.weekday() in allowed_weekdays:
            selected_hour = None

            for hour in preferred_slots:
                candidate_time = time(hour=hour, minute=0)

                if repository.has_teacher_conflict(
                    staff_id=course.staff_id,
                    lesson_date=cursor,
                    lesson_time=candidate_time,
                ):
                    continue

                if not allow_subject_conflicts and repository.has_subject_conflict(
                    course_title=course.title,
                    lesson_date=cursor,
                    lesson_time=candidate_time,
                    exclude_course_id=course.id,
                ):
                    continue

                selected_hour = hour
                break

            if selected_hour is not None:
                lesson_time = time(hour=selected_hour, minute=0)
                slot = repository.get_or_create_slot(
                    staff_id=course.staff_id,
                    slot_date=cursor,
                    slot_time=lesson_time,
                )

                class_number = repository.next_course_class_number(course_id=course_id)
                course_class = repository.create_course_class(
                    course_id=course_id,
                    class_number=class_number,
                    class_description=f"Lesson {class_number}",
                )

                schedule_item = repository.create_schedule(
                    staff_id=course.staff_id,
                    course_class_id=course_class.id,
                    slot_id=slot.id,
                    lesson_date=cursor,
                    lesson_time=lesson_time,
                )
                generated.append(schedule_item)

        cursor = cursor + timedelta(days=1)

    if len(generated) < to_generate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Not enough free slots for selected weekdays/time. "
                f"Generated {len(generated)} of {to_generate} required lessons."
            ),
        )

    return generated


def generate_schedule_from_teacher_slots(
    repository: SchedulingRepository,
    course,
    course_id: int,
    start_date: date,
    required_lessons: int,
    existing_schedules: list,
    strict: bool = True,
    allow_subject_conflicts: bool = False,
) -> list:
    to_generate = required_lessons - len(existing_schedules)
    if to_generate <= 0:
        return []

    free_slots = repository.list_free_staff_slots(staff_id=course.staff_id, start_date=start_date)
    if not free_slots:
        if strict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Teacher has no available free slots from selected date",
            )
        return []

    used_dates = {item.lesson_date for item in existing_schedules}
    generated = []

    for slot in free_slots:
        if len(generated) >= to_generate:
            break

        if slot.slot_time.hour not in ALLOWED_SLOT_HOURS:
            continue

        # One lesson per day for a single course
        if slot.slot_date in used_dates:
            continue

        if repository.has_teacher_conflict(
            staff_id=course.staff_id,
            lesson_date=slot.slot_date,
            lesson_time=slot.slot_time,
        ):
            continue

        if not allow_subject_conflicts and repository.has_subject_conflict(
            course_title=course.title,
            lesson_date=slot.slot_date,
            lesson_time=slot.slot_time,
            exclude_course_id=course.id,
        ):
            continue

        class_number = repository.next_course_class_number(course_id=course_id)
        course_class = repository.create_course_class(
            course_id=course_id,
            class_number=class_number,
            class_description=f"Lesson {class_number}",
        )

        created = repository.create_schedule(
            staff_id=course.staff_id,
            course_class_id=course_class.id,
            slot_id=slot.id,
            lesson_date=slot.slot_date,
            lesson_time=slot.slot_time,
        )

        generated.append(created)
        used_dates.add(slot.slot_date)

    if len(generated) < to_generate and strict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Not enough available slots to complete schedule. "
                f"Generated {len(generated)} of {to_generate} required lessons."
            ),
        )

    return generated
