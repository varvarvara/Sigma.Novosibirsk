import { getAccessToken, request } from "../auth";

export type SeasonStaffMember = {
  id: number;
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  staff_role: string;
};

export type SeasonStudent = {
  id: number;
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  avatar_url?: string | null;
};

export type SeasonTeamMember = {
  id: number;
  team_id: number;
  student_id: number;
  season_id: number;
};

export type TeamMemberName = {
  student_id: number;
  full_name: string;
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getSeasonStaff(seasonId: number) {
  return request<SeasonStaffMember[]>(`/season/${seasonId}/staff`, {
    headers: authHeaders(),
  });
}

export function getSeasonStudents(seasonId: number) {
  return request<SeasonStudent[]>(`/season/${seasonId}/students`, {
    headers: authHeaders(),
  });
}

export function getSeasonExtracurricularTeamMembers(seasonId: number) {
  return request<SeasonTeamMember[]>(`/season/${seasonId}/extracurricular-team-members`, {
    headers: authHeaders(),
  });
}
