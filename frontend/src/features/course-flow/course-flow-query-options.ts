import { queryOptions } from "@tanstack/react-query";
import { isScheduleReadyForStudent } from "./resolve-course-flow";

export const scheduleReadyForStudentQueryKey = ["scheduleReadyForStudent"] as const;

export function scheduleReadyForStudentQueryOptions() {
    return queryOptions({
        queryKey: scheduleReadyForStudentQueryKey,
        queryFn: isScheduleReadyForStudent,
    });
}
