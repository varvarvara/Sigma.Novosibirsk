from collections import defaultdict
from ortools.sat.python import cp_model

def debug_analysis(courses, course_classes, slots, enrollments):
    from collections import defaultdict

    debug = {}

    teacher_slots = defaultdict(list)
    for s in slots:
        teacher_slots[s.staff_id].append(s)

    teacher_required = defaultdict(int)
    for cc in course_classes:
        teacher_required[cc.course.staff_id] += 1

    overload = []

    for t in teacher_required:
        if teacher_required[t] > len(teacher_slots[t]):
            overload.append({
                "teacher_id": t,
                "required_classes": teacher_required[t],
                "available_slots": len(teacher_slots[t])
            })

    debug["teachers_overload"] = overload

    return debug

def generate_schedule(courses, course_classes, slots, enrollments):
    model = cp_model.CpModel()

    slot_by_id = {slot.id: slot for slot in slots}
    course_class_by_id = {cc.id: cc for cc in course_classes}

    student_courses = defaultdict(list)
    for enrollment in enrollments:
        if enrollment.enrollment_status == "Active":
            student_courses[enrollment.student_id].append(enrollment.course_id)

    course_to_classes = defaultdict(list)
    for cc in course_classes:
        course_to_classes[cc.course_id].append(cc.id)

    all_days = sorted({slot.slot_date for slot in slots})
    day_to_index = {day: idx for idx, day in enumerate(all_days)}

    x = {}

    for cc in course_classes:
        teacher_id = cc.course.staff_id
        suitable_slots = [slot for slot in slots if slot.staff_id == teacher_id]

        for slot in suitable_slots:
            x[(cc.id, slot.id)] = model.NewBoolVar(f"x_cc{cc.id}_slot{slot.id}")

    for cc in course_classes:
        possible_vars = [
            x[(cc.id, slot.id)]
            for slot in slots
            if (cc.id, slot.id) in x
        ]

        if not possible_vars:
            return {
                "status": "INFEASIBLE",
                "schedule": [],
                "message": f"Для course_class_id={cc.id} нет ни одного допустимого слота."
            }

        model.Add(sum(possible_vars) == 1)

    teacher_time_vars = defaultdict(list)

    for (cc_id, slot_id), var in x.items():
        slot = slot_by_id[slot_id]
        key = (slot.staff_id, slot.slot_date, slot.slot_time)
        teacher_time_vars[key].append(var)

    for vars_list in teacher_time_vars.values():
        model.Add(sum(vars_list) <= 1)

    for student_id, course_ids in student_courses.items():
        for slot in slots:
            vars_list = []

            for course_id in course_ids:
                for cc_id in course_to_classes.get(course_id, []):
                    if (cc_id, slot.id) in x:
                        vars_list.append(x[(cc_id, slot.id)])

            if vars_list:
                model.Add(sum(vars_list) <= 1)

    student_day_vars = defaultdict(list)

    for (cc_id, slot_id), var in x.items():
        slot = slot_by_id[slot_id]
        day = slot.slot_date

        cc = course_class_by_id[cc_id]
        course_id = cc.course_id

        for student_id, selected_course_ids in student_courses.items():
            if course_id in selected_course_ids:
                student_day_vars[(student_id, day)].append(var)

    for (student_id, day), vars_list in student_day_vars.items():
        model.Add(sum(vars_list) <= 4)

    student_day_used_vars = []

    for student_id in student_courses:
        for day in all_days:
            vars_list = student_day_vars.get((student_id, day), [])

            if not vars_list:
                continue

            used_var = model.NewBoolVar(f"student_{student_id}_day_{day}_used")
            model.Add(sum(vars_list) >= 1).OnlyEnforceIf(used_var)
            model.Add(sum(vars_list) == 0).OnlyEnforceIf(used_var.Not())

            student_day_used_vars.append(used_var)

    inside_window_used_vars = []

    for course in courses:
        duration = 3 if course.course_type == "ThreeDays" else 6
        cc_ids = course_to_classes.get(course.id, [])

        if not cc_ids:
            continue

        if len(all_days) < duration:
            return {
                "status": "INFEASIBLE",
                "schedule": [],
                "message": (
                    f"Для курса {course.title} недостаточно дней в слотах: "
                    f"нужно {duration}, доступно {len(all_days)}."
                ),
            }

        course_day_assignment_vars = {}
        course_day_used_vars = {}

        for day in all_days:
            vars_for_day = []

            for cc_id in cc_ids:
                for slot in slots:
                    if (cc_id, slot.id) in x and slot.slot_date == day:
                        vars_for_day.append(x[(cc_id, slot.id)])

            course_day_assignment_vars[day] = vars_for_day

            if vars_for_day:
                used_var = model.NewBoolVar(f"course_{course.id}_day_{day}_used")
                model.Add(sum(vars_for_day) == used_var)
                course_day_used_vars[day] = used_var

        for day, vars_for_day in course_day_assignment_vars.items():
            if vars_for_day:
                model.Add(sum(vars_for_day) <= 1)

        max_start = len(all_days) - duration
        start_vars = []

        for start_idx in range(max_start + 1):
            start_var = model.NewBoolVar(f"course_{course.id}_start_{start_idx}")
            start_vars.append((start_idx, start_var))

        model.Add(sum(start_var for _, start_var in start_vars) == 1)

        day_in_window = {}

        for day in all_days:
            day_idx = day_to_index[day]
            covering_start_vars = []

            for start_idx, start_var in start_vars:
                if start_idx <= day_idx < start_idx + duration:
                    covering_start_vars.append(start_var)

            in_window_var = model.NewBoolVar(f"course_{course.id}_day_{day}_in_window")

            if covering_start_vars:
                model.Add(in_window_var == sum(covering_start_vars))
            else:
                model.Add(in_window_var == 0)

            day_in_window[day] = in_window_var

        for day, used_var in course_day_used_vars.items():
            in_window_var = day_in_window[day]

            inside_used_var = model.NewBoolVar(f"course_{course.id}_day_{day}_inside_used")

            model.Add(inside_used_var <= used_var)
            model.Add(inside_used_var <= in_window_var)
            model.Add(inside_used_var >= used_var + in_window_var - 1)

            inside_window_used_vars.append(inside_used_var)

    print("=== DIAGNOSTICS ===")

    teacher_slot_count = defaultdict(int)
    for slot in slots:
        teacher_slot_count[slot.staff_id] += 1

    print("Slots per teacher:")
    for teacher_id, count in sorted(teacher_slot_count.items()):
        print(f"teacher {teacher_id}: {count}")

    course_required_classes = defaultdict(int)
    for cc in course_classes:
        course_required_classes[cc.course_id] += 1

    print("Classes per course:")
    for course in courses:
        print(
            f"course {course.id} ({course.title}) | "
            f"teacher={course.staff_id} | "
            f"type={course.course_type} | "
            f"classes={course_required_classes[course.id]} | "
            f"teacher_slots={teacher_slot_count[course.staff_id]}"
        )

    teacher_required_classes = defaultdict(int)
    for course in courses:
        teacher_required_classes[course.staff_id] += course_required_classes[course.id]

    print("Required classes per teacher:")
    for teacher_id in sorted(teacher_required_classes):
        print(
            f"teacher {teacher_id}: "
            f"required_classes={teacher_required_classes[teacher_id]}, "
            f"slots={teacher_slot_count[teacher_id]}"
        )

    print("Active enrollments per student:")
    student_load = defaultdict(int)
    for e in enrollments:
        if e.enrollment_status == "Active":
            student_load[e.student_id] += 1

    for student_id, count in sorted(student_load.items()):
        print(f"student {student_id}: {count} courses")

    objective_terms = []

    if inside_window_used_vars:
        objective_terms.append(50 * sum(inside_window_used_vars))

    if student_day_used_vars:
        objective_terms.append(5 * sum(student_day_used_vars))

    if objective_terms:
        model.Maximize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 15

    status = solver.Solve(model)
    
    if status == cp_model.INFEASIBLE:
        return {
            "status": "INFEASIBLE",
            "schedule": [],
            "debug": debug_analysis(courses, course_classes, slots, enrollments)
        }

    if status == cp_model.OPTIMAL:
        status_name = "OPTIMAL"
    elif status == cp_model.FEASIBLE:
        status_name = "FEASIBLE"
    elif status == cp_model.INFEASIBLE:
        status_name = "INFEASIBLE"
    elif status == cp_model.MODEL_INVALID:
        status_name = "MODEL_INVALID"
    else:
        status_name = "UNKNOWN"

    result = []

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for (cc_id, slot_id), var in x.items():
            if solver.Value(var) == 1:
                slot = slot_by_id[slot_id]
                result.append(
                    {
                        "course_class_id": cc_id,
                        "slot_id": slot_id,
                        "date": str(slot.slot_date),
                        "time": str(slot.slot_time),
                    }
                )

        result.sort(key=lambda item: (item["date"], item["time"], item["course_class_id"]))

    return {
        "status": status_name,
        "schedule": result,
    }