import { getAccessToken, request } from '../auth';

export type TeacherCourseStudentAttendanceSummary = {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  attended_lessons: number;
  total_lessons: number;
  attendance_percent: number;
};

export type TeacherCourseAttendanceSummary = {
  course_id: number;
  course_title: string;
  staff_id: number;
  teacher_name: string;
  students: TeacherCourseStudentAttendanceSummary[];
};

export type TeacherLessonAttendanceItem = {
  schedule_id: number;
  lesson_date: string;
  lesson_time: string;
  attendance_status: boolean | null;
};

export type TeacherCourseStudentAttendanceDetail = TeacherCourseStudentAttendanceSummary & {
  course_id: number;
  course_title: string;
  attendance_points: number;
  lessons: TeacherLessonAttendanceItem[];
};

export type TeacherAchievement = {
  id: number;
  achievement_name: string;
  achievement_description: string;
  course_id: number;
  achievement_score: number;
  season_id: number;
  icon_image_key: string | null;
  icon_url: string | null;
};

export type TeacherAchievementState = {
  achievement_id: number;
  assigned: boolean;
  student_achievement_id: number | null;
};

export type TeacherAchievementStudent = {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  achievements: TeacherAchievementState[];
};

export type TeacherAchievementMatrix = {
  course_id: number;
  course_title: string;
  staff_id: number;
  teacher_name: string;
  achievements: TeacherAchievement[];
  students: TeacherAchievementStudent[];
};

export type BulkAttendanceItem = {
  student_id: number;
  attendance_status: boolean;
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getCourseAttendanceSummary(courseId: number) {
  return request<TeacherCourseAttendanceSummary>(`/attendance/courses/${courseId}/summary`, {
    headers: authHeaders(),
  });
}

export function getCourseStudentAttendanceDetail(courseId: number, studentId: number) {
  return request<TeacherCourseStudentAttendanceDetail>(`/attendance/courses/${courseId}/students/${studentId}`, {
    headers: authHeaders(),
  });
}

export function bulkMarkAttendance(scheduleId: number, items: BulkAttendanceItem[]) {
  return request(`/attendance/schedules/${scheduleId}/mark-bulk`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  });
}

export function getCourseAchievementMatrix(courseId: number) {
  return request<TeacherAchievementMatrix>(`/attendance/courses/${courseId}/achievement-matrix`, {
    headers: authHeaders(),
  });
}

export function assignAchievement(studentId: number, achievementId: number) {
  return request('/attendance/achievements/assign', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      student_id: studentId,
      achievement_id: achievementId,
    }),
  });
}
