import { queryClient } from "../../app/query-client";
import {
    enrollmentSlotOptionsQueryOptions,
    myEnrollmentsQueryOptions,
    myScheduleEventsQueryOptions,
    schedulePublishStatusQueryOptions,
} from "../../entities/student/queries/learning.query-options";
import {
    normalizeEnrollmentSlotOptions,
    sanitizeDraftSelectionByHour,
} from "./enrollment-slot-times";

export type CourseFlowStage =
    | "empty"
    | "choose_prompt"
    | "selecting"
    | "waiting_schedule"
    | "active";

export const COURSE_FLOW_PATH: Record<CourseFlowStage, string> = {
    empty: "/course-nothing",
    choose_prompt: "/course-choice",
    selecting: "/courses",
    waiting_schedule: "/soon-update",
    active: "/my-courses",
};

export const COURSE_SELECTION_PATHS = ["/courses", "/course-detail", "/course-card"] as const;

const parsedSeasonId = Number(import.meta.env.VITE_DEFAULT_SEASON_ID ?? 1);
const DEFAULT_SEASON_ID = Number.isFinite(parsedSeasonId) && parsedSeasonId > 0 ? parsedSeasonId : 1;

export const DRAFT_SELECTION_STORAGE_KEY = "selected_courses_by_slot_hour";
const COURSE_FLOW_OVERRIDE_KEY = "course_flow_override";

const VALID_STAGES = new Set<CourseFlowStage>([
    "empty",
    "choose_prompt",
    "selecting",
    "waiting_schedule",
    "active",
]);

function readStageOverride(): CourseFlowStage | null {
    const value = localStorage.getItem(COURSE_FLOW_OVERRIDE_KEY);
    if (!value || !VALID_STAGES.has(value as CourseFlowStage)) {
        return null;
    }
    return value as CourseFlowStage;
}

export function isCourseSelectionPath(pathname: string) {
    return COURSE_SELECTION_PATHS.some((path) => pathname === path);
}

export function readDraftSelectionByHour(slots: { slot_hour: number; courses: { course_id: number }[] }[]) {
    const nextSelected: Record<number, number> = {};
    const draftRaw = localStorage.getItem(DRAFT_SELECTION_STORAGE_KEY);
    const parsedDraft = draftRaw ? (JSON.parse(draftRaw) as Record<string, number>) : {};
    const draft = sanitizeDraftSelectionByHour(parsedDraft);

    for (const slot of slots) {
        const draftCourseId = draft[String(slot.slot_hour)];
        if (draftCourseId && slot.courses.some((course) => course.course_id === draftCourseId)) {
            nextSelected[slot.slot_hour] = draftCourseId;
        }
    }

    return nextSelected;
}

async function loadCourseFlowSnapshot() {
    const [slotOptionsRaw, enrollments, publishStatus] = await Promise.all([
        queryClient.ensureQueryData(enrollmentSlotOptionsQueryOptions()),
        queryClient.ensureQueryData(myEnrollmentsQueryOptions()),
        queryClient.ensureQueryData(schedulePublishStatusQueryOptions(DEFAULT_SEASON_ID)),
    ]);

    return {
        slotOptions: normalizeEnrollmentSlotOptions(slotOptionsRaw),
        enrollments,
        publishStatus,
    };
}

export async function resolveCourseFlowStage(): Promise<CourseFlowStage> {
    const override = readStageOverride();
    if (override) {
        return override;
    }

    // Access to the student's course list depends only on their enrollments.
    // Slot and schedule endpoints must not hide already assigned courses.
    const enrollments = await queryClient.ensureQueryData(myEnrollmentsQueryOptions());
    const activeEnrollments = enrollments.filter((item) => item.enrollment_status === "Active");
    if (activeEnrollments.length > 0) {
        return "active";
    }

    const slotOptionsRaw = await queryClient.ensureQueryData(enrollmentSlotOptionsQueryOptions());
    const slotOptions = normalizeEnrollmentSlotOptions(slotOptionsRaw);

    const hasPublishedSlots = slotOptions.slots.some((slot) => slot.courses.length > 0);
    if (!hasPublishedSlots) {
        return "empty";
    }

    const draft = readDraftSelectionByHour(slotOptions.slots);
    if (Object.keys(draft).length > 0) {
        return "selecting";
    }

    return "choose_prompt";
}

/** Расписание в календаре — только после полной записи, публикации и появления занятий. */
export async function isScheduleReadyForStudent(): Promise<boolean> {
    const { slotOptions, enrollments, publishStatus } = await loadCourseFlowSnapshot();

    const activeEnrollments = enrollments.filter((item) => item.enrollment_status === "Active");
    const requiredCount = slotOptions.required_slot_hours.length || 3;

    if (activeEnrollments.length < requiredCount) {
        return false;
    }

    if (!publishStatus.published) {
        return false;
    }

    const schedule = await queryClient.ensureQueryData(
        myScheduleEventsQueryOptions(DEFAULT_SEASON_ID),
    );
    if (schedule.schedule_published === false) {
        return false;
    }

    const enrolledCourseIds = new Set(activeEnrollments.map((item) => item.course_id));
    return schedule.events.some((event) => enrolledCourseIds.has(event.extendedProps.course_id));
}
