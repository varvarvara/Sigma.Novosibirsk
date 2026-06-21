import { apiClient } from "../../../shared/api/client";
import { AuthApiError } from "../../auth";
import { 
  EnrollmentOutput,
  EnrollmentSelectionIn,
  EnrollmentSlotOptionsOut,
  EnrollmentSubmitOut,
  StudentAttendanceChargeOut,
  StudentAttendanceFilterOptionsOut,
  StudentAttendanceDashboardOut,
  StudentAchievementDetailedOut,
  ScheduleEventsOut,
  SchedulePublishStatusOut
} from "../model/learning.types";

export async function getEnrollmentSlotOptions() {
  return await apiClient.get<EnrollmentSlotOptionsOut>("/enrollment/slots/options")
    .then((response) => response.data);
}

export async function submitEnrollmentSlotSelection(selections: EnrollmentSelectionIn[]) {
  return await apiClient.post<EnrollmentSubmitOut>("/enrollment/slots/submit", { selections })
    .then((response) => response.data);
}

export async function getMyEnrollments() {
  return await apiClient.get<EnrollmentOutput[]>("/enrollment/me")
    .then((response) => response.data);
}

export async function getMyAttendanceDashboard() {
  return await apiClient.get<StudentAttendanceDashboardOut>("/attendance/me")
    .then((response) => response.data);
}

export async function getMyAttendanceFilterOptions() {
  return await apiClient.get<StudentAttendanceFilterOptionsOut>("/attendance/me/filter-options")
    .then((response) => response.data);
}

export async function getMyAttendanceCharges() {
  return await apiClient.get<StudentAttendanceChargeOut[]>("/attendance/me/charges")
    .then((response) => response.data);
}

export async function getMyAchievements() {
  return await apiClient.get<StudentAchievementDetailedOut[]>("/attendance/me/achievements")
    .then((response) => response.data);
}

export async function getMyScheduleEvents(seasonId: number) {
  return await apiClient.get<ScheduleEventsOut>(`/scheduling/events?season_id=${seasonId}`)
    .then((response) => response.data);
}

export async function getSchedulePublishStatus(seasonId: number) {
  try {
    const response = await apiClient.get<SchedulePublishStatusOut>(`/scheduling/publish-status?season_id=${seasonId}`);
    return response.data;
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 404) {
      return { season_id: seasonId, published: false };
    }

    throw error;
  }
}
