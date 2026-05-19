import { getAccessToken, request } from '../auth';

export type TeacherCourse = {
  id: number;
  title: string;
  description: string | null;
  syllabus_url: string | null;
  cover_image_url: string | null;
  course_status: 'Draft' | 'Archived' | 'Published';
  course_duration: 'ThreeDays' | 'SixDays';
  course_type: 'Olympiad' | 'Author';
  staff_id: number;
  teacher_name: string | null;
  capacity: number | null;
  average_rating: number | null;
  feedback_count: number;
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getMyTeacherCourses() {
  return request<TeacherCourse[]>('/courses/my', {
    headers: authHeaders(),
  });
}

export function formatCourseTypeLabel(type: TeacherCourse['course_type']) {
  return type === 'Olympiad' ? 'Олимпиадный' : 'Авторский';
}

export function formatCourseStatusLabel(status: TeacherCourse['course_status']) {
  if (status === 'Published') {
    return 'Опубликованные';
  }
  if (status === 'Archived') {
    return 'В архиве';
  }
  return 'Созданные';
}
