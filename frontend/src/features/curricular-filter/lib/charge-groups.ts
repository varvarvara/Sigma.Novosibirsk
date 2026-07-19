import type {
    StudentAchievementDetailedOut,
    StudentAttendanceChargeOut,
} from "../../../entities/student/model/learning.types";
import {
    formatFilterDateLabel,
    readCurricularChargesFilter,
} from "../model/curricular-charges-filter";

export type ChargeGroup = {
    dateKey: string;
    dateLabel: string;
    items: Array<{
        id: string;
        title: string;
        value: string;
        points: string;
        iconSrc: string;
        kind: "attendance" | "achievement";
        description?: string;
    }>;
};

export function applyChargesFilter(
    charges: StudentAttendanceChargeOut[],
    filter: ReturnType<typeof readCurricularChargesFilter>,
) {
    const attendedCharges = charges.filter((item) => item.attended && item.points > 0);
    if (!filter) {
        return attendedCharges;
    }

    const courseIds = new Set(filter.courseIds);
    const dates = new Set(filter.dates);
    const hasCourseFilter = courseIds.size > 0;
    const hasDateFilter = dates.size > 0;

    return attendedCharges.filter((item) => {
        if (hasCourseFilter && !courseIds.has(item.course_id)) {
            return false;
        }

        if (hasDateFilter && !dates.has(item.lesson_date)) {
            return false;
        }

        return true;
    });
}

export function groupChargesByDate(charges: StudentAttendanceChargeOut[]): ChargeGroup[] {
    const groups = new Map<string, ChargeGroup>();

    for (const charge of charges) {
        const existing = groups.get(charge.lesson_date) ?? {
            dateKey: charge.lesson_date,
            dateLabel: formatFilterDateLabel(charge.lesson_date),
            items: [],
        };

        existing.items.push({
            id: String(charge.schedule_id),
            title: charge.course_title,
            value: charge.teacher_name,
            points: `+${charge.points}`,
            iconSrc: "/raster-icons/magic.png",
            kind: "attendance",
        });

        groups.set(charge.lesson_date, existing);
    }

    return Array.from(groups.values()).sort((left, right) => left.dateKey.localeCompare(right.dateKey));
}

export function applyAchievementFilter(
    achievements: StudentAchievementDetailedOut[],
    filter: ReturnType<typeof readCurricularChargesFilter>,
) {
    if (!filter) {
        return achievements;
    }

    const courseIds = new Set(filter.courseIds);
    const dates = new Set(filter.dates);
    const hasCourseFilter = courseIds.size > 0;
    const hasDateFilter = dates.size > 0;

    return achievements.filter((item) => {
        const awardedDate = item.awarded_at.slice(0, 10);

        if (hasCourseFilter && !courseIds.has(item.course_id)) {
            return false;
        }

        if (hasDateFilter && !dates.has(awardedDate)) {
            return false;
        }

        return true;
    });
}

export function groupLearningCharges(
    attendanceCharges: StudentAttendanceChargeOut[],
    achievements: StudentAchievementDetailedOut[],
): ChargeGroup[] {
    const groups = new Map<string, ChargeGroup>();

    for (const group of groupChargesByDate(attendanceCharges)) {
        groups.set(group.dateKey, group);
    }

    for (const achievement of achievements) {
        const awardedDate = achievement.awarded_at.slice(0, 10);
        const existing = groups.get(awardedDate) ?? {
            dateKey: awardedDate,
            dateLabel: formatFilterDateLabel(awardedDate),
            items: [],
        };

        existing.items.push({
            id: `achievement-${achievement.id}`,
            title: achievement.achievement_name,
            value: achievement.course_title,
            description: achievement.achievement_description,
            points: `+${achievement.achievement_score}`,
            iconSrc: "/raster-icons/star.png",
            kind: "achievement",
        });

        groups.set(awardedDate, existing);
    }

    return Array.from(groups.values())
        .map((group) => ({
            ...group,
            items: [...group.items].sort((left, right) => {
                if (left.kind !== right.kind) {
                    return left.kind === "achievement" ? -1 : 1;
                }

                return left.title.localeCompare(right.title);
            }),
        }))
        .sort((left, right) => right.dateKey.localeCompare(left.dateKey));
}
