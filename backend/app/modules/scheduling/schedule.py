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
MAX_LESSONS_PER_TIMESLOT = 9
ACTIVE_STUDY_DATES = {
    date(2026, 7, 23),
    date(2026, 7, 24),
    date(2026, 7, 25),
    date(2026, 7, 27),
    date(2026, 7, 28),
    date(2026, 7, 29),
}


def _is_active_study_day(target_date: date) -> bool:
    return target_date in ACTIVE_STUDY_DATES


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
    fixed_hour: int | None = None
    cursor = data.start_date
    max_cursor_date = data.start_date + timedelta(days=180)

    while len(generated) < to_generate and cursor <= max_cursor_date:
        if not _is_active_study_day(cursor):
            cursor = cursor + timedelta(days=1)
            continue

        if cursor.weekday() in allowed_weekdays:
            selected_hour = None

            candidate_hours = [fixed_hour] if fixed_hour is not None else preferred_slots
            for hour in candidate_hours:
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
                if fixed_hour is None:
                    fixed_hour = selected_hour
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
                    season_id=course.season_id,
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
    fixed_lesson_time: time | None = existing_schedules[0].lesson_time if existing_schedules else None
    generated = []
    day_load_cache: dict[date, int] = {}
    timeslot_load_cache: dict[tuple[date, time], int] = {}

    def get_day_load(target_date: date) -> int:
        if target_date not in day_load_cache:
            day_load_cache[target_date] = repository.count_lessons_on_date(
                lesson_date=target_date,
                season_id=course.season_id,
            )
        return day_load_cache[target_date]

    def get_timeslot_load(target_date: date, target_time: time) -> int:
        key = (target_date, target_time)
        if key not in timeslot_load_cache:
            timeslot_load_cache[key] = repository.count_lessons_in_timeslot(
                lesson_date=target_date,
                lesson_time=target_time,
            )
        return timeslot_load_cache[key]

    def is_slot_eligible(slot) -> bool:
        if not _is_active_study_day(slot.slot_date):
            return False
        if slot.slot_time.hour not in ALLOWED_SLOT_HOURS:
            return False
        if slot.slot_date in used_dates:
            return False
        if get_timeslot_load(slot.slot_date, slot.slot_time) >= MAX_LESSONS_PER_TIMESLOT:
            return False
        if fixed_lesson_time is not None and slot.slot_time != fixed_lesson_time:
            return False
        return True

    if fixed_lesson_time is None:
        slots_by_time: dict[time, list] = {}
        for slot in free_slots:
            if not _is_active_study_day(slot.slot_date):
                continue
            if slot.slot_time.hour not in ALLOWED_SLOT_HOURS:
                continue
            if get_timeslot_load(slot.slot_date, slot.slot_time) >= MAX_LESSONS_PER_TIMESLOT:
                continue
            slots_by_time.setdefault(slot.slot_time, []).append(slot)

        if not slots_by_time:
            if strict:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Teacher has no allowed free slots in active days",
                )
            return []

        ranked_times = []
        for slot_time, slots_for_time in slots_by_time.items():
            unique_days = sorted({slot.slot_date for slot in slots_for_time})
            can_cover = len(unique_days) >= to_generate
            top_days = sorted(unique_days, key=lambda day: (get_day_load(day), day))[:to_generate]
            load_score = sum(
                (get_day_load(day) * 100) + get_timeslot_load(day, slot_time)
                for day in top_days
            )
            ranked_times.append((
                0 if can_cover else 1,
                load_score,
                len(unique_days),
                slot_time,
            ))

        ranked_times.sort(key=lambda item: (item[0], item[1], -item[2], item[3]))
        fixed_lesson_time = ranked_times[0][3]

    eligible_slots = [slot for slot in free_slots if is_slot_eligible(slot)]
    eligible_slots.sort(
        key=lambda slot: (
            get_day_load(slot.slot_date),
            get_timeslot_load(slot.slot_date, slot.slot_time),
            slot.slot_date,
            slot.slot_time,
            slot.id,
        )
    )

    for slot in eligible_slots:
        if len(generated) >= to_generate:
            break

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
            season_id=course.season_id,
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
        day_load_cache[slot.slot_date] = get_day_load(slot.slot_date) + 1
        timeslot_key = (slot.slot_date, slot.slot_time)
        timeslot_load_cache[timeslot_key] = get_timeslot_load(slot.slot_date, slot.slot_time) + 1
        if fixed_lesson_time is None:
            fixed_lesson_time = slot.slot_time

    if len(generated) < to_generate and strict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Not enough available slots to complete schedule. "
                f"Generated {len(generated)} of {to_generate} required lessons."
            ),
        )

    return generated
