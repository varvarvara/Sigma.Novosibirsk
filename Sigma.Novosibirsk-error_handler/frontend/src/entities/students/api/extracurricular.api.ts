import { apiClient } from "../../../shared/api/client";
import { StudentExtracurricularDashboard } from "../model/extracurricular.types";

export async function getMyExtracurricular(seasonId = 1) {
  return await apiClient.get<StudentExtracurricularDashboard>(`/gamification/me/extracurricular?season_id=${seasonId}`)
    .then((response) => response.data);
}
