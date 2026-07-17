import { apiClient } from "../../../shared/api/client";
import { DEFAULT_SEASON_ID } from "../../../features/auth/student-registration";
import {
  ExtracurricularActivity,
  ExtracurricularActivityCreate,
  ExtracurricularScoreCreate,
  ExtracurricularScoreSummary,
  ExtracurricularTeam,
  ExtracurricularTeamCreate,
  ExtracurricularTeamMember,
  ExtracurricularTeamMemberCreate,
  ExtracurricularTeamMemberName,
} from "../model/extracurricular.types";

export const DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE = 200;

export async function listExtracurricularActivities() {
  return await apiClient.get<ExtracurricularActivity[]>("/gamification/activity")
    .then((response) => response.data);
}

export async function createExtracurricularActivity(payload: ExtracurricularActivityCreate) {
  return await apiClient.post<ExtracurricularActivity>("/gamification/activity", payload)
    .then((response) => response.data);
}

export async function listExtracurricularTeams() {
  return await apiClient.get<ExtracurricularTeam[]>("/gamification/team").then((response) => response.data);
}

export async function createExtracurricularTeam(payload: ExtracurricularTeamCreate) {
  return await apiClient.post<ExtracurricularTeam>("/gamification/team", payload)
  .then((response) => response.data);
}

export async function addExtracurricularTeamMember(payload: ExtracurricularTeamMemberCreate) {
  return await apiClient.post<ExtracurricularTeamMember>("/gamification/team/member", payload)
    .then((response) => response.data);
}

export async function listExtracurricularTeamMembers(teamId: number, seasonId = buildSeasonId()) {
  return await apiClient.get<ExtracurricularTeamMemberName[]>(`/gamification/team/${teamId}/members?season_id=${seasonId}`)
    .then((response) => response.data);
}

export async function listExtracurricularScores() {
  return await apiClient.get<ExtracurricularScoreSummary[]>("/gamification/score")
    .then((response) => response.data);
}

export async function markExtracurricularTeamAttendance(payload: ExtracurricularScoreCreate) {
  return await apiClient.post<unknown>("/gamification/score", payload)
    .then((response) => response.data);
}

export async function buildSeasonId(seasonId = DEFAULT_SEASON_ID) {
  return seasonId;
}
