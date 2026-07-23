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

export type ExtracurricularTeamUpdate = {
  ex_team_number?: number;
  ex_team_name?: string;
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

export type ExtracurricularTeamMemberName = {
  student_id: number;
  full_name: string;
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
