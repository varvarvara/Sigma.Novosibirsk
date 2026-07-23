import { apiClient } from "../../../shared/api/client";
import { DEFAULT_SEASON_ID } from "../../../features/auth/student-registration";
import {
  ExtracurricularActivity,
  ExtracurricularActivityCreate,
  ExtracurricularScoreCreate,
  ExtracurricularScoreSummary,
  ExtracurricularTeam,
  ExtracurricularTeamCreate,
  ExtracurricularTeamUpdate,
  ExtracurricularTeamMember,
  ExtracurricularTeamMemberCreate,
  ExtracurricularTeamMemberName,
} from "../model/extracurricular.types";

export const DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE = 200;

export async function listExtracurricularActivities(seasonId = buildSeasonId()) {
  return await apiClient.get<ExtracurricularActivity[]>(`/season/${seasonId}/extracurricular-activities`)
    .then((response) => response.data);
}

export async function createExtracurricularActivity(payload: ExtracurricularActivityCreate) {
  return await apiClient.post<ExtracurricularActivity>("/gamification/activity", payload)
    .then((response) => response.data);
}

export async function listExtracurricularTeams(seasonId = buildSeasonId()) {
  return await apiClient.get<ExtracurricularTeam[]>(`/season/${seasonId}/extracurricular-teams`).then((response) => response.data);
}

export async function createExtracurricularTeam(payload: ExtracurricularTeamCreate) {
  return await apiClient.post<ExtracurricularTeam>("/gamification/team", payload)
  .then((response) => response.data);
}

export async function updateExtracurricularTeam(teamId: number, payload: ExtracurricularTeamUpdate) {
  return await apiClient.patch<ExtracurricularTeam>(`/gamification/team/${teamId}`, payload)
    .then((response) => response.data);
}

export async function deleteExtracurricularTeam(teamId: number) {
  return await apiClient.delete(`/gamification/team/${teamId}`);
}

export async function addExtracurricularTeamMember(payload: ExtracurricularTeamMemberCreate) {
  return await apiClient.post<ExtracurricularTeamMember>("/gamification/team/member", payload)
    .then((response) => response.data);
}

export async function removeExtracurricularTeamMember(teamId: number, studentId: number) {
  return await apiClient.delete(`/gamification/team/${teamId}/members/${studentId}`);
}

export async function listExtracurricularTeamMembers(teamId: number, seasonId = buildSeasonId()) {
  return await apiClient.get<ExtracurricularTeamMemberName[]>(`/gamification/team/${teamId}/members?season_id=${seasonId}`)
    .then((response) => response.data);
}

export async function listExtracurricularScores(seasonId = buildSeasonId()) {
  return await apiClient.get<ExtracurricularScoreSummary[]>(`/season/${seasonId}/extracurricular-scores`)
    .then((response) => response.data);
}

export async function markExtracurricularTeamAttendance(payload: ExtracurricularScoreCreate) {
  return await apiClient.post<unknown>("/gamification/score", payload)
    .then((response) => response.data);
}

export function buildSeasonId(seasonId = DEFAULT_SEASON_ID) {
  return seasonId;
}
