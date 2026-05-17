import { getAccessToken, request } from "../auth";

export type ExtracurricularTeamMember = {
  student_id: number;
  full_name: string;
};

export type ExtracurricularMyTeam = {
  team_id: number;
  team_number: number;
  team_name: string;
  total_coins: number;
  rating_place: number | null;
  members: ExtracurricularTeamMember[];
};

export type ExtracurricularRatingTeam = {
  place: number;
  team_id: number;
  team_name: string;
  members_label: string;
  total_coins: number;
};

export type ExtracurricularCharge = {
  id: number;
  activity_name: string;
  role_label: string;
  coins: number;
};

export type StudentExtracurricularDashboard = {
  has_team: boolean;
  my_team: ExtracurricularMyTeam | null;
  rating: ExtracurricularRatingTeam[];
  charges: ExtracurricularCharge[];
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getMyExtracurricular(seasonId = 1) {
  return request<StudentExtracurricularDashboard>(
    `/gamification/me/extracurricular?season_id=${seasonId}`,
    {
      headers: authHeaders(),
    },
  );
}
