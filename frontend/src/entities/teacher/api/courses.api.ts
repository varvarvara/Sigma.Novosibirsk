import { apiClient } from "../../../shared/api/client";
import { TeacherCourse } from "../model/courses.types";

export async function getMyTeacherCourses() {
  return await apiClient.get<TeacherCourse[]>("/courses/my")
    .then((response) => response.data);
}

export function formatCourseTypeLabel(type: TeacherCourse["course_type"]) {
  return type === "Olympiad" ? "Олимпиадный" : "Авторский";
}

export function formatCourseStatusLabel(status: TeacherCourse["course_status"]) {
  if (status === "Published") {
    return "Опубликованные";
  }
  if (status === "Archived") {
    return "В архиве";
  }
  return "Созданные";
}