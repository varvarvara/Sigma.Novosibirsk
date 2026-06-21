import type { EnrollmentSlotOptionsOut, SlotOptionsItem } from "../../entities/student/model/learning.types";

/** Внутренние id слотов записи (не часы на часах). */
export const ENROLLMENT_SLOT_HOURS = [9, 10, 11] as const;

export const ENROLLMENT_SLOT_TIME_LABELS: Record<number, string> = {
    9: "10:00 - 11:00",
    10: "11:20 - 12:20",
    11: "12:40 - 13:40",
};

export function isEnrollmentSlotHour(slotHour: number): slotHour is (typeof ENROLLMENT_SLOT_HOURS)[number] {
    return (ENROLLMENT_SLOT_HOURS as readonly number[]).includes(slotHour);
}

export function formatEnrollmentSlotTime(slotHour: number): string {
    return ENROLLMENT_SLOT_TIME_LABELS[slotHour] ?? "";
}

/** Только 3 урока; лишние слоты (например, старый 12) отбрасываются. */
export function normalizeEnrollmentSlots(slots: SlotOptionsItem[]): SlotOptionsItem[] {
    return ENROLLMENT_SLOT_HOURS.map((slotHour) => {
        const existing = slots.find((slot) => slot.slot_hour === slotHour);
        return (
            existing ?? {
                slot_hour: slotHour,
                courses: [],
            }
        );
    });
}

export function normalizeEnrollmentSlotOptions(response: EnrollmentSlotOptionsOut): EnrollmentSlotOptionsOut {
    return {
        required_slot_hours: [...ENROLLMENT_SLOT_HOURS],
        slots: normalizeEnrollmentSlots(response.slots),
    };
}

export function sanitizeDraftSelectionByHour(draft: Record<string, number>): Record<string, number> {
    const sanitized: Record<string, number> = {};

    for (const slotHour of ENROLLMENT_SLOT_HOURS) {
        const courseId = draft[String(slotHour)];
        if (courseId) {
            sanitized[String(slotHour)] = courseId;
        }
    }

    return sanitized;
}
