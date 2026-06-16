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