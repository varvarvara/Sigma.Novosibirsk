from collections import defaultdict
from datetime import date, time

from ortools.sat.python import cp_model


LESSON_START_TIMES = {
    time(10, 0),
    time(11, 20),
    time(12, 40),
}

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


def _course_duration_value(course_duration):
    return course_duration.value if hasattr(course_duration, "value") else str(course_duration)


def _required_lessons(course) -> int:
    course_duration = _course_duration_value(course.course_duration)
    if course_duration == "SixDays":
        return 6
    return 3


def _consecutive_windows(days, length):
    # Consecutiveness is calculated over available study days list.
    # This allows fixed blackout dates to be skipped globally.
    return [days[i:i + length] for i in range(len(days) - length + 1)]


def debug_analysis(courses, course_classes, slots, enrollments):
    teacher_slots = defaultdict(list)
    for slot in slots:
        if slot.slot_time in LESSON_START_TIMES:
            teacher_slots[slot.staff_id].append(slot)

    teacher_required = defaultdict(int)
    for cc in course_classes:
        teacher_required[cc.course.staff_id] += 1

    teachers_overload = []
    for teacher_id, required_count in teacher_required.items():
        available_count = len(teacher_slots[teacher_id])
        if required_count > available_count:
            teachers_overload.append({
                "teacher_id": teacher_id,
                "required_classes": required_count,
                "available_slots": available_count,
            })

    course_class_mismatch = []
    course_to_classes = defaultdict(list)
    for cc in course_classes:
        course_to_classes[cc.course_id].append(cc)

    for course in courses:
        expected = _required_lessons(course)
        actual = len(course_to_classes.get(course.id, []))
        if actual != expected:
            course_class_mismatch.append({
                "course_id": course.id,
                "course_title": course.title,
                "expected_classes": expected,
                "actual_classes": actual,
            })

    return {
        "teachers_overload": teachers_overload,
        "course_class_mismatch": course_class_mismatch,
    }


def generate_schedule(courses, course_classes, slots, enrollments):
    model = cp_model.CpModel()

    valid_slots = [
        slot for slot in slots
        if slot.slot_time in LESSON_START_TIMES and _is_active_study_day(slot.slot_date)
    ]

    if not valid_slots:
        return {
            "status": "INFEASIBLE",
            "schedule": [],
            "message": "Нет валидных слотов для уроков 10:00, 11:20, 12:40.",
        }

    slot_by_id = {slot.id: slot for slot in valid_slots}
    course_by_id = {course.id: course for course in courses}
    course_class_by_id = {cc.id: cc for cc in course_classes}

    course_to_classes = defaultdict(list)
    for cc in course_classes:
        course_to_classes[cc.course_id].append(cc)

    for course_id in course_to_classes:
        course_to_classes[course_id].sort(key=lambda cc: cc.class_number)

    all_days = sorted({slot.slot_date for slot in valid_slots})

    student_courses = defaultdict(list)
    for enrollment in enrollments:
        if enrollment.enrollment_status == "Active":
            student_courses[enrollment.student_id].append(enrollment.course_id)

    x = {}

    for cc in course_classes:
        teacher_id = cc.course.staff_id

        for slot in valid_slots:
            if slot.staff_id == teacher_id:
                x[(cc.id, slot.id)] = model.NewBoolVar(f"x_cc{cc.id}_slot{slot.id}")

    for cc in course_classes:
        possible_vars = [
            x[(cc.id, slot.id)]
            for slot in valid_slots
            if (cc.id, slot.id) in x
        ]

        if not possible_vars:
            return {
                "status": "INFEASIBLE",
                "schedule": [],
                "message": f"Для course_class_id={cc.id} нет допустимых слотов преподавателя.",
                "debug": debug_analysis(courses, course_classes, slots, enrollments),
            }

        model.Add(sum(possible_vars) == 1)

    teacher_time = defaultdict(list)

    for (cc_id, slot_id), var in x.items():
        slot = slot_by_id[slot_id]
        teacher_time[(slot.staff_id, slot.slot_date, slot.slot_time)].append(var)

    for vars_list in teacher_time.values():
        model.Add(sum(vars_list) <= 1)

    # Global capacity: no more than N lessons in one shared timeslot (date + time).
    timeslot_load = defaultdict(list)
    for (cc_id, slot_id), var in x.items():
        slot = slot_by_id[slot_id]
        timeslot_load[(slot.slot_date, slot.slot_time)].append(var)

    for vars_list in timeslot_load.values():
        model.Add(sum(vars_list) <= MAX_LESSONS_PER_TIMESLOT)

    # Each active day (except blocked ones) must have at least one lesson.
    day_load = defaultdict(list)
    for (cc_id, slot_id), var in x.items():
        slot = slot_by_id[slot_id]
        day_load[slot.slot_date].append(var)

    for day, vars_list in day_load.items():
        model.Add(sum(vars_list) >= 1)

    for student_id, course_ids in student_courses.items():
        for slot in valid_slots:
            vars_list = []

            for course_id in course_ids:
                for cc in course_to_classes.get(course_id, []):
                    if (cc.id, slot.id) in x:
                        vars_list.append(x[(cc.id, slot.id)])

            if vars_list:
                model.Add(sum(vars_list) <= 1)

    for student_id, course_ids in student_courses.items():
        for day in all_days:
            vars_list = []

            for course_id in course_ids:
                for cc in course_to_classes.get(course_id, []):
                    for slot in valid_slots:
                        if slot.slot_date == day and (cc.id, slot.id) in x:
                            vars_list.append(x[(cc.id, slot.id)])

            if vars_list:
                model.Add(sum(vars_list) <= 3)

    sorted_slots = sorted(
        valid_slots,
        key=lambda slot: (slot.slot_date, slot.slot_time, slot.id),
    )
    slot_position = {slot.id: index for index, slot in enumerate(sorted_slots)}

    for course in courses:
        classes = course_to_classes.get(course.id, [])
        expected_lessons = _required_lessons(course)

        if not classes:
            continue

        if len(classes) != expected_lessons:
            return {
                "status": "INFEASIBLE",
                "schedule": [],
                "message": (
                    f"Для курса {course.title} ожидается {expected_lessons} занятий, "
                    f"а в course_class найдено {len(classes)}."
                ),
                "debug": debug_analysis(courses, course_classes, slots, enrollments),
            }

        available_times = sorted({
            slot.slot_time
            for cc in classes
            for slot in valid_slots
            if (cc.id, slot.id) in x
        })

        if not available_times:
            return {
                "status": "INFEASIBLE",
                "schedule": [],
                "message": f"Для курса {course.title} нет доступных временных слотов.",
                "debug": debug_analysis(courses, course_classes, slots, enrollments),
            }

        selected_time_vars = {
            slot_time: model.NewBoolVar(
                f"course{course.id}_time_{slot_time.hour:02d}{slot_time.minute:02d}"
            )
            for slot_time in available_times
        }
        model.Add(sum(selected_time_vars.values()) == 1)

        for cc in classes:
            per_time_vars = {
                slot_time: [
                    x[(cc.id, slot.id)]
                    for slot in valid_slots
                    if slot.slot_time == slot_time and (cc.id, slot.id) in x
                ]
                for slot_time in available_times
            }

            for slot_time, vars_for_time in per_time_vars.items():
                if not vars_for_time:
                    model.Add(selected_time_vars[slot_time] == 0)
                    continue

                # If a time is selected for a course, each lesson of this course
                # must be assigned to that same time.
                model.Add(sum(vars_for_time) == 1).OnlyEnforceIf(selected_time_vars[slot_time])
                model.Add(sum(vars_for_time) == 0).OnlyEnforceIf(selected_time_vars[slot_time].Not())

        windows = _consecutive_windows(all_days, expected_lessons)

        if not windows:
            return {
                "status": "INFEASIBLE",
                "schedule": [],
                "message": f"Нет окна из {expected_lessons} подряд дней для курса {course.title}.",
                "debug": debug_analysis(courses, course_classes, slots, enrollments),
            }

        window_vars = []
        for window_index, window in enumerate(windows):
            window_var = model.NewBoolVar(f"course{course.id}_window{window_index}")
            window_vars.append((window_var, set(window)))

        model.Add(sum(window_var for window_var, _ in window_vars) == 1)

        day_has_lesson = {}
        for day in all_days:
            day_vars = []

            for cc in classes:
                for slot in valid_slots:
                    if slot.slot_date == day and (cc.id, slot.id) in x:
                        day_vars.append(x[(cc.id, slot.id)])

            day_var = model.NewBoolVar(f"course{course.id}_day_{day.isoformat()}")
            day_has_lesson[day] = day_var

            if day_vars:
                # Hard rule: at most one lesson of the same course per day.
                model.Add(sum(day_vars) <= 1)
                model.Add(sum(day_vars) == 1).OnlyEnforceIf(day_var)
                model.Add(sum(day_vars) == 0).OnlyEnforceIf(day_var.Not())
            else:
                model.Add(day_var == 0)

            for window_var, window_days in window_vars:
                if day in window_days:
                    model.Add(day_var == 1).OnlyEnforceIf(window_var)
                else:
                    model.Add(day_var == 0).OnlyEnforceIf(window_var)

        # Extra guard: the course must occupy exactly expected number of distinct days.
        model.Add(sum(day_has_lesson.values()) == expected_lessons)

        class_positions = []

        for cc in classes:
            position = model.NewIntVar(0, len(sorted_slots) - 1, f"position_cc{cc.id}")

            possible_terms = [
                slot_position[slot.id] * x[(cc.id, slot.id)]
                for slot in valid_slots
                if (cc.id, slot.id) in x
            ]

            model.Add(position == sum(possible_terms))
            class_positions.append(position)

        for index in range(len(class_positions) - 1):
            model.Add(class_positions[index] < class_positions[index + 1])

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30

    status = solver.Solve(model)

    if status == cp_model.INFEASIBLE:
        return {
            "status": "INFEASIBLE",
            "schedule": [],
            "debug": debug_analysis(courses, course_classes, slots, enrollments),
        }

    if status == cp_model.MODEL_INVALID:
        return {
            "status": "MODEL_INVALID",
            "schedule": [],
        }

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {
            "status": "UNKNOWN",
            "schedule": [],
        }

    result = []

    for (cc_id, slot_id), var in x.items():
        if solver.Value(var) == 1:
            slot = slot_by_id[slot_id]
            result.append({
                "course_class_id": cc_id,
                "slot_id": slot_id,
                "date": str(slot.slot_date),
                "time": str(slot.slot_time),
                "class_number": course_class_by_id[cc_id].class_number,
                "course_id": course_class_by_id[cc_id].course_id,
            })

    result.sort(
        key=lambda item: (
            item["date"],
            item["time"],
            item["course_id"],
            item["class_number"],
        )
    )

    return {
        "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
        "schedule": result,
    }
