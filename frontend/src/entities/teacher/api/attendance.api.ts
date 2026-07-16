import { apiClient } from "../../../shared/api/client";
import {
  BulkAttendanceItem,
  TeacherAchievementMatrix,
  TeacherCourseStudentAttendanceDetail,
  TeacherCourseAttendanceSummary,
} from "../model/attendance.types";

export async function getCourseAttendanceSummary(courseId: number) {
  return await apiClient.get<TeacherCourseAttendanceSummary>(`/attendance/courses/${courseId}/summary`)
    .then((response) => response.data);
}

export async function getCourseStudentAttendanceDetail(courseId: number, studentId: number) {
  return await apiClient.get<TeacherCourseStudentAttendanceDetail>(`/attendance/courses/${courseId}/students/${studentId}`)
    .then((response) => response.data);
}

export async function bulkMarkAttendance(scheduleId: number, items: BulkAttendanceItem[]) {
  return await apiClient.post(`/attendance/schedules/${scheduleId}/mark-bulk`, { items })
    .then((response) => response.data);
}

export async function getCourseAchievementMatrix(courseId: number) {
  return await apiClient.get<TeacherAchievementMatrix>(`/attendance/courses/${courseId}/achievement-matrix`)
    .then((response) => response.data);
}

export async function assignAchievement(studentId: number, achievementId: number) {
  return await apiClient.post("/attendance/achievements/assign", {
    student_id: studentId,
    achievement_id: achievementId,
  })
    .then((response) => response.data);
}
