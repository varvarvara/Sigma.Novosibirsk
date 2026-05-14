import { getAccessToken, request } from "../auth";

export type Student = {
  id: number;
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  phone: string;
  tg_nickname?: string | null;
  year_of_study: number;
  city?: string | null;
  school?: string | null;
  parent_name: string;
  parent_phone: string;
  student_status: string;
};

export type StudentInCreate = {
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  phone: string;
  tg_nickname?: string | null;
  year_of_study: number;
  city?: string | null;
  school?: string | null;
  parent_name: string;
  parent_phone: string;
  password: string;
  season_id: number;
};

export type Gamification = {
  id: number;
  student_id: number;
  attendance_score: number;
  achievement_score: number;
  extracurricular_score: number;
  total_score: number;
  level: number;
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function signupStudent(data: StudentInCreate) {
  return request<Student>("/users/students/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentStudent() {
  return request<Student>("/users/me", {
    headers: authHeaders(),
  });
}

export function getStudentGamification(studentId: number) {
  return request<Gamification>(`/gamification/gamification/${studentId}`, {
    headers: authHeaders(),
  });
}
