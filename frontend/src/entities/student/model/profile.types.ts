export type Student = {
  id: number;
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  phone: string;
  tg_nickname?: string | null;
  birth_date?: string | null;
  year_of_study: number;
  city?: string | null;
  school?: string | null;
  parent_name: string;
  parent_phone: string;
  student_status: string;
  avatar_url?: string | null;
};

export type StaffProfile = {
  id: number;
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  staff_role: string;
  birth_date?: string | null;
  university?: string | null;
  study_direction?: string | null;
  study_year?: number | null;
  avatar_url?: string | null;
};

export type AvatarUploadOut = {
  avatar_url: string;
  avatar_image_key: string;
};

export type CurrentUser = Student | StaffProfile;

export function isStaffProfile(user: CurrentUser): user is StaffProfile {
  return "staff_role" in user;
}

export type StudentInCreate = {
  first_name: string;
  last_name: string;
  partonymic?: string | null;
  email: string;
  phone: string;
  tg_nickname?: string | null;
  year_of_study: number;
  city?: string | null;
  school?: string | null;
  parent_name: string;
  parent_phone: string;
  password: string;
  season_id: number;
};

export type Gamification = {
  id: number;
  student_id: number;
  attendance_score: number;
  achievement_score: number;
  extracurricular_score: number;
  total_score: number;
  level: number;
};

export type StudentTeam = {
  team_number: number;
  team_name: string;
};

export type StaffMeUpdate = {
  first_name?: string;
  last_name?: string;
  partonymic?: string | null;
  birth_date?: string | null;
  university?: string | null;
  study_direction?: string | null;
  study_year?: number | null;
};

export type StudentMeUpdate = {
  first_name?: string;
  last_name?: string;
  partonymic?: string | null;
  birth_date?: string | null;
  year_of_study?: number;
  city?: string | null;
  school?: string | null;
  phone?: string;
  tg_nickname?: string | null;
  parent_name?: string;
  parent_phone?: string;
};
