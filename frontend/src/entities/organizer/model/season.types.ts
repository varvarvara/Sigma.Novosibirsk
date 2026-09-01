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