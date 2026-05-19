import { getAccessToken, request } from '../auth';

export type TeacherTimetableItem = {
  schedule_id: number;
  course_id: number;
  course_title: string;
  class_number: number;
  staff_id: number;
  teacher_name: string;
  lesson_date: string;
  lesson_time: string;
  classroom: string | null;
  slot_id: number | null;
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getTeacherTimetable(staffId: number) {
  return request<TeacherTimetableItem[]>(`/scheduling/timetable/teachers/${staffId}`, {
    headers: authHeaders(),
  });
}
