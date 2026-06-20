import type { StaffProfile } from '../../entities/students/model/profile.types';

export const TEACHER_DEFAULT_AVATAR_SRC = '/default-avatar.svg';
export const TEACHER_AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export type TeacherProfileData = {
  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  university: string;
  direction: string;
  course: string;
};

type TeacherFullName = {
  firstName: string;
  lastName: string;
  patronymic: string;
}

export const emptyTeacherProfileData: TeacherProfileData = {
  firstName: '',
  lastName: '',
  patronymic: '',
  email: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
  university: '',
  direction: '',
  course: '',
};

export function mapStaffToTeacherProfile(staff: StaffProfile): TeacherProfileData {
  const birthParts = staff.birth_date?.split('-') ?? [];

  return {
    firstName: staff.first_name,
    lastName: staff.last_name,
    patronymic: staff.partonymic ?? '',
    email: staff.email,
    birthYear: birthParts[0] ?? '',
    birthMonth: birthParts[1] ?? '',
    birthDay: birthParts[2] ?? '',
    university: staff.university ?? '',
    direction: staff.study_direction ?? '',
    course: staff.study_year ? String(staff.study_year) : '',
  };
}

export function getTeacherFullName(profile: TeacherFullName) {
  return [profile.lastName, profile.firstName, profile.patronymic].filter(Boolean).join(' ');
}

export function formatTeacherBirthDateForApi(day: string, month: string, year: string) {
  const dayValue = day.trim();
  const monthValue = month.trim();
  const yearValue = year.trim();

  if (!dayValue && !monthValue && !yearValue) {
    return null;
  }

  return `${yearValue}-${monthValue.padStart(2, '0')}-${dayValue.padStart(2, '0')}`;
}

export const TEACHER_STUDY_YEAR_OPTIONS = ['1', '2', '3', '4', '5', '6'] as const;
