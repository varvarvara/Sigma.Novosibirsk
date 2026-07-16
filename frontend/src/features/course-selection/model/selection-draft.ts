import type { EnrollmentOutput, SlotOptionsItem } from "../../../entities/student/model/learning.types";
import { readDraftSelectionByHour } from "../../course-flow/resolve-course-flow";

export function hydrateSelectionFromEnrollments(
    slotOptions: SlotOptionsItem[],
    enrollments: EnrollmentOutput[],
) {
    const nextSelected = readDraftSelectionByHour(slotOptions);

    for (const slot of slotOptions) {
        if (nextSelected[slot.slot_hour]) {
            continue;
        }

        const activeEnrollment = enrollments.find(
            (enrollment) =>
                enrollment.enrollment_status === "Active" &&
                slot.courses.some((course) => course.course_id === enrollment.course_id),
        );

        if (activeEnrollment) {
            nextSelected[slot.slot_hour] = activeEnrollment.course_id;
        }
    }

    return nextSelected;
}
