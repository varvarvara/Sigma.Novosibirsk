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
