import { getAccessToken, request } from "../auth";
import { DEFAULT_SEASON_ID } from "../../features/auth/student-registration";

export type ExtracurricularActivity = {
  id: number;
  ex_course_name: string;
  staff_id: number;
  ex_course_score: number;
};

export type ExtracurricularActivityCreate = {
  ex_course_name: string;
  staff_id: number;
  ex_course_score: number;
  season_id: number;
};

export type ExtracurricularTeam = {
  id: number;
  ex_team_number: number;
  ex_team_name: string;
};

export type ExtracurricularTeamCreate = {
  ex_team_number: number;
  ex_team_name: string;
  season_id: number;
};

export type ExtracurricularTeamMemberCreate = {
  team_id: number;
  student_id: number;
  season_id: number;
};

export type ExtracurricularTeamMember = {
  id: number;
  team_id: number;
  student_id: number;
};

export type ExtracurricularScoreCreate = {
  team_id: number;
  ex_course_id: number;
  season_id: number;
};

export type ExtracurricularScoreSummary = {
  team_id: number;
  ex_course_id: number;
  score: number;
};

export const DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE = 200;

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function listExtracurricularActivities() {
  return request<ExtracurricularActivity[]>("/gamification/activity", {
    headers: authHeaders(),
  });
}

export function createExtracurricularActivity(data: ExtracurricularActivityCreate) {
  return request<ExtracurricularActivity>("/gamification/activity", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export function listExtracurricularTeams() {
  return request<ExtracurricularTeam[]>("/gamification/team", {
    headers: authHeaders(),
  });
}

export function createExtracurricularTeam(data: ExtracurricularTeamCreate) {
  return request<ExtracurricularTeam>("/gamification/team", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export function addExtracurricularTeamMember(data: ExtracurricularTeamMemberCreate) {
  return request<ExtracurricularTeamMember>("/gamification/team/member", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export function listExtracurricularScores() {
  return request<ExtracurricularScoreSummary[]>("/gamification/score", {
    headers: authHeaders(),
  });
}

export function markExtracurricularTeamAttendance(data: ExtracurricularScoreCreate) {
  return request<unknown>("/gamification/score", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export function buildSeasonId(seasonId = DEFAULT_SEASON_ID) {
  return seasonId;
}
