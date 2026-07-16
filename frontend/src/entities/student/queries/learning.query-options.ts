import { queryOptions } from "@tanstack/react-query";
import {
    getEnrollmentSlotOptions,
    getMyAchievements,
    getMyAttendanceCharges,
    getMyAttendanceDashboard,
    getMyAttendanceFilterOptions,
    getMyEnrollments,
    getMyScheduleEvents,
    getSchedulePublishStatus,
} from "../api/learning.api";

export const learningQueryKeys = {
    enrollmentSlotOptions: ["getEnrollmentSlotOptions"] as const,
    enrollmentSlotSelection: ["SubmitEnrollmentSlotSelection"] as const,
    myEnrollments: ["getMyEnrollments"] as const,
    myAttendanceFilterOptions: ["getMyAttendanceFilterOptions"] as const,
    myAttendanceCharges: ["getMyAttendanceCharges"] as const,
    myAttendanceDashboard: ["getMyAttendanceDashboard"] as const,
    myAchievements: ["getMyAchievements"] as const,
    myScheduleEvents: (seasonId: number) => ["getMyScheduleEvents", seasonId] as const,
    schedulePublishStatus: (seasonId: number) => ["getSchedulePublishStatus", seasonId] as const,
};

export function enrollmentSlotOptionsQueryOptions() {
    return queryOptions({
        queryKey: learningQueryKeys.enrollmentSlotOptions,
        queryFn: getEnrollmentSlotOptions,
    });
}

export function myEnrollmentsQueryOptions() {
    return queryOptions({
        queryKey: learningQueryKeys.myEnrollments,
        queryFn: getMyEnrollments,
    });
}

export function myAttendanceFilterOptionsQueryOptions() {
    return queryOptions({
        queryKey: learningQueryKeys.myAttendanceFilterOptions,
        queryFn: getMyAttendanceFilterOptions,
    });
}

export function myAttendanceChargesQueryOptions() {
    return queryOptions({
        queryKey: learningQueryKeys.myAttendanceCharges,
        queryFn: getMyAttendanceCharges,
    });
}

export function myAttendanceDashboardQueryOptions() {
    return queryOptions({
        queryKey: learningQueryKeys.myAttendanceDashboard,
        queryFn: getMyAttendanceDashboard,
    });
}

export function myAchievementsQueryOptions() {
    return queryOptions({
        queryKey: learningQueryKeys.myAchievements,
        queryFn: getMyAchievements,
    });
}

export function myScheduleEventsQueryOptions(seasonId: number) {
    return queryOptions({
        queryKey: learningQueryKeys.myScheduleEvents(seasonId),
        queryFn: () => getMyScheduleEvents(seasonId),
    });
}

export function schedulePublishStatusQueryOptions(seasonId: number) {
    return queryOptions({
        queryKey: learningQueryKeys.schedulePublishStatus(seasonId),
        queryFn: () => getSchedulePublishStatus(seasonId),
    });
}
