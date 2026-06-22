import { apiClient } from "../../../shared/api/client";
import { AuthApiError } from "../../auth";
import {
  AvatarUploadOut,
  CurrentUser,
  Gamification,
  StaffMeUpdate,
  StaffProfile,
  Student,
  StudentInCreate,
  StudentMeUpdate,
  StudentTeam,
} from "../model/profile.types";

export async function signupStudent(payload: StudentInCreate) {
  return await apiClient.post<Student>("/users/students/signup", payload)
    .then((response) => response.data);
}

export async function getCurrentStudent() {
  return await apiClient.get<CurrentUser>("/users/me")
    .then((response) => response.data);
}

async function patchMyStaffProfile(payload: StaffMeUpdate) {
  return await apiClient.patch<StaffProfile>("/users/me", payload)
    .then((response) => response.data);
}

export async function updateMyStaffProfile(payload: StaffMeUpdate) {
  try {
    return await patchMyStaffProfile(payload);
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 405) {
      throw error;
    }

    try {
      const response = await apiClient.put<StaffProfile>("/users/me", payload);
      return response.data;
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
    const response = await apiClient.patch<Student>("/users/me", payload);
    return response.data;
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 405) {
      throw error;
    }

    try {
      const response = await apiClient.put<Student>("/users/me", payload);
      return response.data;
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

export async function getStudentGamification(studentId: number) {
  return await apiClient.get<Gamification>(`/gamification/gamification/${studentId}`)
    .then((response) => response.data);
}

export async function getStudentTeam(studentId: number) {
  return await apiClient.get<StudentTeam>(`/gamification/team/${studentId}`)
    .then((response) => response.data);
}

export async function uploadMyAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<AvatarUploadOut>("/users/me/avatar", formData);
  return response.data;
}

export async function deleteMyAvatar() {
  return await apiClient.delete<CurrentUser>("/users/me/avatar")
    .then((response) => response.data);
}
