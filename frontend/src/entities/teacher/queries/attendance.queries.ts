import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignAchievement,
  bulkMarkAttendance,
  getCourseAchievementMatrix,
  getCourseAttendanceSummary,
  getCourseStudentAttendanceDetail,
} from "../api/attendance.api";
import type {
  BulkAttendanceItem,
  TeacherAchievementMatrix,
  TeacherCourseAttendanceSummary,
  TeacherCourseStudentAttendanceDetail,
} from "../model/attendance.types";

export const teacherAttendanceQueryKeys = {
  courseSummary: (courseId: number) => ["teacherAttendanceSummary", courseId] as const,
  courseDetails: (courseId: number) => ["teacherAttendanceDetails", courseId] as const,
  achievementMatrix: (courseId: number) => ["teacherAchievementMatrix", courseId] as const,
};

export function useTeacherCourseAttendanceSummaryQuery(courseId?: number) {
  return useQuery({
    queryKey: courseId
      ? teacherAttendanceQueryKeys.courseSummary(courseId)
      : ["teacherAttendanceSummary", "unknown"],
    queryFn: () => getCourseAttendanceSummary(courseId as number),
    enabled: typeof courseId === "number",
  });
}

export function useTeacherCourseAttendanceDetailsQuery(
  courseId?: number,
  summary?: TeacherCourseAttendanceSummary | null,
) {
  return useQuery({
    queryKey: courseId
      ? teacherAttendanceQueryKeys.courseDetails(courseId)
      : ["teacherAttendanceDetails", "unknown"],
    queryFn: async (): Promise<TeacherCourseStudentAttendanceDetail[]> => {
      const students = summary?.students ?? [];
      return Promise.all(
        students.map((student) =>
          getCourseStudentAttendanceDetail(courseId as number, student.student_id),
        ),
      );
    },
    enabled: typeof courseId === "number" && Boolean(summary),
  });
}

export function useBulkMarkAttendanceMutation(courseId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Array<{ scheduleId: number; items: BulkAttendanceItem[] }>,
    ) => {
      await Promise.all(
        payload.map((entry) => bulkMarkAttendance(entry.scheduleId, entry.items)),
      );
    },
    onSuccess: async () => {
      if (typeof courseId !== "number") {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherAttendanceQueryKeys.courseSummary(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: teacherAttendanceQueryKeys.courseDetails(courseId),
        }),
      ]);
    },
  });
}

export function useTeacherCourseAchievementMatrixQuery(courseId?: number) {
  return useQuery({
    queryKey: courseId
      ? teacherAttendanceQueryKeys.achievementMatrix(courseId)
      : ["teacherAchievementMatrix", "unknown"],
    queryFn: () => getCourseAchievementMatrix(courseId as number),
    enabled: typeof courseId === "number",
  });
}

export function useAssignAchievementMutation(courseId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Array<{ studentId: number; achievementId: number }>) => {
      await Promise.all(
        payload.map((assignment) => assignAchievement(assignment.studentId, assignment.achievementId)),
      );
    },
    onSuccess: async () => {
      if (typeof courseId !== "number") {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: teacherAttendanceQueryKeys.achievementMatrix(courseId),
      });
    },
  });
}
