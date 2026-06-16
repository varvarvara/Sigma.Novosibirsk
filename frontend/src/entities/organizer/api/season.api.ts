import { apiClient } from "../../../shared/api/client";
import type { SeasonStaffMember, SeasonStudent, SeasonTeamMember } from "../model/season.types";

export async function getSeasonStaff(seasonId: number) {
  return await apiClient.get<SeasonStaffMember[]>(`/season/${seasonId}/staff`)
    .then((response) => response.data);
}

export async function getSeasonStudents(seasonId: number) {
  return await apiClient.get<SeasonStudent[]>(`/season/${seasonId}/students`)
    .then((response) => response.data);
}

export async function getSeasonExtracurricularTeamMembers(seasonId: number) {
  return await apiClient.get<SeasonTeamMember[]>(`/season/${seasonId}/extracurricular-team-members`)
    .then((response) => response.data);
}
