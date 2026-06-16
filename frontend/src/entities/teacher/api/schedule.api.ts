import { apiClient } from "../../../shared/api/client";
import { TeacherTimetableItem } from "../model/schedule.types";

export async function getTeacherTimetable(staffId: number) {
  return await apiClient.get<TeacherTimetableItem[]>(`/scheduling/timetable/teachers/${staffId}`)
    .then((response) => response.data);
}
