import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submitEnrollmentSlotSelection } from "../api/learning.api";
import {
    enrollmentSlotOptionsQueryOptions,
    learningQueryKeys,
    myAchievementsQueryOptions,
    myAttendanceChargesQueryOptions,
    myAttendanceDashboardQueryOptions,
    myAttendanceFilterOptionsQueryOptions,
    myEnrollmentsQueryOptions,
    myScheduleEventsQueryOptions,
    schedulePublishStatusQueryOptions,
} from "./learning.query-options";

import type { EnrollmentSelectionIn } from "../model/learning.types";

export { learningQueryKeys } from "./learning.query-options";

export function useEnrollmentSlotOptionsQuery() {
    return useQuery(enrollmentSlotOptionsQueryOptions());
}

export function useMyEnrollmentsQuery() {
    return useQuery(myEnrollmentsQueryOptions());
}

export function useMyAttendanceFilterOptionsQuery() {
    return useQuery(myAttendanceFilterOptionsQueryOptions());
}

export function useMyAttendanceChargesQuery() {
    return useQuery(myAttendanceChargesQueryOptions());
}

export function useMyAttendanceDashboardQuery() {
    return useQuery(myAttendanceDashboardQueryOptions());
}

export function useMyAchievementsQuery() {
    return useQuery(myAchievementsQueryOptions());
}

export function useMyScheduleEventsQuery(seasonId: number) {
    return useQuery(myScheduleEventsQueryOptions(seasonId));
}

export function useSchedulePublishStatusQuery(seasonId: number) {
    return useQuery(schedulePublishStatusQueryOptions(seasonId));
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
