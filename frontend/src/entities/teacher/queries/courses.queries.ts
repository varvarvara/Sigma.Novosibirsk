import { useQuery } from "@tanstack/react-query";
import { getMyTeacherCourses } from "../api/courses.api";


export const teacherQueryKey = ["teacherCourses"] as const;

export function useGetMyTeacherCourses() {
    return useQuery({
        queryKey: teacherQueryKey,
        queryFn: getMyTeacherCourses,
    });
}