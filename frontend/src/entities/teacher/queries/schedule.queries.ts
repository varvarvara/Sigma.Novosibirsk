import { useQuery } from "@tanstack/react-query";
import { getTeacherTimetable } from "../api/schedule.api";

export const teacherScheduleQueryKeys = {
    timetable: (staffId: number) => ["teacherTimetable", staffId] as const,
};

export function useTeacherTimetableQuery(staffId?: number) {
    return useQuery({
        queryKey: staffId
            ? teacherScheduleQueryKeys.timetable(staffId)
            : ["teacherTimetable", "unknown"],
        queryFn: () => getTeacherTimetable(staffId as number),
        enabled: typeof staffId === "number",
    });
}
