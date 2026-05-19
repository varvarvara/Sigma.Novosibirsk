import { AuthApiError, getAccessToken, request } from "../auth";

export type Student = {
  id: number;
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  phone: string;
  tg_nickname?: string | null;
  birth_date?: string | null;
  year_of_study: number;
  city?: string | null;
  school?: string | null;
  parent_name: string;
  parent_phone: string;
  student_status: string;
  avatar_url?: string | null;
};

export type StaffProfile = {
  id: number;
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  staff_role: string;
  birth_date?: string | null;
  university?: string | null;
  study_direction?: string | null;
  study_year?: number | null;
  avatar_url?: string | null;
};

export type AvatarUploadOut = {
  avatar_url: string;
  avatar_image_key: string;
};

export type CurrentUser = Student | StaffProfile;

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

export type StudentTeam = {
  team_number: number;
  team_name: string;
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
  return request<CurrentUser>("/users/me", {
    headers: authHeaders(),
  });
}

export type StaffMeUpdate = {
  first_name?: string;
  last_name?: string;
  partonymic?: string | null;
  birth_date?: string | null;
  university?: string | null;
  study_direction?: string | null;
  study_year?: number | null;
};

export type StudentMeUpdate = {
  first_name?: string;
  last_name?: string;
  partonymic?: string | null;
  birth_date?: string | null;
  year_of_study?: number;
  city?: string | null;
  school?: string | null;
  phone?: string;
  tg_nickname?: string | null;
  parent_name?: string;
  parent_phone?: string;
};

async function patchMyStaffProfile(payload: StaffMeUpdate) {
  return request<StaffProfile>("/users/me", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateMyStaffProfile(payload: StaffMeUpdate) {
  try {
    return await patchMyStaffProfile(payload);
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 405) {
      throw error;
    }

    try {
      return await request<StaffProfile>("/users/me", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (putError) {
      if (putError instanceof AuthApiError && putError.status === 405) {
        throw new AuthApiError(
          "Сервер не принимает обновление профиля. Перезапустите backend: docker compose up -d --build",
          405,
          putError.details,
        );
      }
      throw putError;
    }
  }
}

export async function updateMyStudentProfile(payload: StudentMeUpdate) {
  try {
    return await request<Student>("/users/me", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 405) {
      throw error;
    }

    try {
      return await request<Student>("/users/me", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (putError) {
      if (putError instanceof AuthApiError && putError.status === 405) {
        throw new AuthApiError(
          "Сервер не принимает обновление профиля. Перезапустите backend: docker compose up -d --build",
          405,
          putError.details,
        );
      }
      throw putError;
    }
  }
}

export function getStudentGamification(studentId: number) {
  return request<Gamification>(`/gamification/gamification/${studentId}`, {
    headers: authHeaders(),
  });
}

export function getStudentTeam(studentId: number) {
  return request<StudentTeam>(`/gamification/team/${studentId}`, {
    headers: authHeaders(),
  });
}

export function uploadMyAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return request<AvatarUploadOut>("/users/me/avatar", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
}

export function deleteMyAvatar() {
  return request<CurrentUser>("/users/me/avatar", {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export function isStaffProfile(user: CurrentUser): user is StaffProfile {
  return "staff_role" in user;
}
