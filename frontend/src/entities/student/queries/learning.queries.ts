import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getEnrollmentSlotOptions,
    submitEnrollmentSlotSelection,
    getMyEnrollments,
    getMyAttendanceFilterOptions,
    getMyAttendanceCharges,
    getMyAttendanceDashboard,
    getMyAchievements,
    getMyScheduleEvents,
    getSchedulePublishStatus
} from "../api/learning.api";

import type { EnrollmentSelectionIn } from "../model/learning.types";

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
}

export function useEnrollmentSlotOptionsQuery() {
    return useQuery({
        queryKey: learningQueryKeys.enrollmentSlotOptions,
        queryFn: getEnrollmentSlotOptions,
    });
}

export function useMyEnrollmentsQuery() {
    return useQuery({
        queryKey: learningQueryKeys.myEnrollments,
        queryFn: getMyEnrollments,
    });
}

export function useMyAttendanceFilterOptionsQuery() {
    return useQuery({
        queryKey: learningQueryKeys.myAttendanceFilterOptions,
        queryFn: getMyAttendanceFilterOptions,
    });
}

export function useMyAttendanceChargesQuery() {
    return useQuery({
        queryKey: learningQueryKeys.myAttendanceCharges,
        queryFn: getMyAttendanceCharges,
    });
}

export function useMyAttendanceDashboardQuery() {
    return useQuery({
        queryKey: learningQueryKeys.myAttendanceDashboard,
        queryFn: getMyAttendanceDashboard,
    });
}

export function useMyAchievementsQuery() {
    return useQuery({
        queryKey: learningQueryKeys.myAchievements,
        queryFn: getMyAchievements,
    });
}

export function useMyScheduleEventsQuery(seasonId: number) {
    return useQuery({
        queryKey: learningQueryKeys.myScheduleEvents(seasonId),
        queryFn: () => getMyScheduleEvents(seasonId),
    });
}

export function useSchedulePublishStatusQuery(seasonId: number) {
    return useQuery({
        queryKey: learningQueryKeys.schedulePublishStatus(seasonId),
        queryFn: () => getSchedulePublishStatus(seasonId),
    });
}

export function useEnrollmentSlotSelectionQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (selections: EnrollmentSelectionIn[]) =>
            submitEnrollmentSlotSelection(selections),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: learningQueryKeys.myEnrollments}),
                queryClient.invalidateQueries({queryKey: learningQueryKeys.enrollmentSlotOptions}),
            ])
        }
    })
}
