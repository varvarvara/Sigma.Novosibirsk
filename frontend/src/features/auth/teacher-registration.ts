import { AuthApiError, staffPreRegistration, type StaffPreRegistrationRequest } from '../../entities/auth'
import { validateBirthDate } from './birth-date-validation'
import { DEFAULT_SEASON_ID, extractPhoneDigits } from './student-registration'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DESCRIPTION_MAX_LENGTH = 500

export type TeacherRegistrationForm = {
  firstName: string
  lastName: string
  patronymic: string
  birthDay: string
  birthMonth: string
  birthYear: string
  phone: string
  email: string
  social: string
  university: string
  direction: string
  studyYear: string
  courseName: string
  courseType: string
  courseDescription: string
}

export type TeacherRegistrationErrors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'birthDate'
    | 'phone'
    | 'email'
    | 'university'
    | 'direction'
    | 'studyYear'
    | 'courseName'
    | 'courseType'
    | 'courseDescription'
    | 'consent'
    | 'form',
    string
  >
>

export function validateTeacherRegistration(
  form: TeacherRegistrationForm,
  options: { consentAccepted: boolean },
): TeacherRegistrationErrors {
  const errors: TeacherRegistrationErrors = {}
  const email = form.email.trim()

  if (!form.firstName.trim()) {
    errors.firstName = 'Заполните поле.'
  }
  if (!form.lastName.trim()) {
    errors.lastName = 'Заполните поле.'
  }

  const birthDateError = validateBirthDate(form.birthDay, form.birthMonth, form.birthYear)
  if (birthDateError) {
    errors.birthDate = birthDateError
  }

  if (extractPhoneDigits(form.phone).length < 10) {
    errors.phone = 'Введите номер полностью.'
  }

  if (!email) {
    errors.email = 'Заполните поле.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Введите корректную почту.'
  }

  if (!form.university.trim()) {
    errors.university = 'Заполните поле.'
  }
  if (!form.direction.trim()) {
    errors.direction = 'Заполните поле.'
  }
  if (!form.studyYear) {
    errors.studyYear = 'Выберите курс.'
  }

  if (!form.courseName.trim()) {
    errors.courseName = 'Заполните поле.'
  }
  if (!form.courseType) {
    errors.courseType = 'Выберите тип курса.'
  }

  if (!form.courseDescription.trim()) {
    errors.courseDescription = 'Заполните поле.'
  } else if (form.courseDescription.length > DESCRIPTION_MAX_LENGTH) {
    errors.courseDescription = `Не более ${DESCRIPTION_MAX_LENGTH} символов.`
  }

  if (!options.consentAccepted) {
    errors.consent = 'Подтвердите согласие на обработку персональных данных.'
  }

  return errors
}

function formatBirthDateForApi(day: string, month: string, year: string) {
  return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`
}

export function buildStaffPreRegistrationPayload(form: TeacherRegistrationForm): StaffPreRegistrationRequest {
  const phoneDigits = extractPhoneDigits(form.phone)

  return {
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    partonymic: form.patronymic.trim() || null,
    phone: `+7${phoneDigits}`,
    email: form.email.trim(),
    tg_nickname: form.social.trim() || null,
    season_id: DEFAULT_SEASON_ID,
    birth_date: formatBirthDateForApi(form.birthDay, form.birthMonth, form.birthYear),
    university: form.university.trim(),
    study_direction: form.direction.trim(),
    study_year: Number(form.studyYear),
    proposed_course_title: form.courseName.trim(),
    proposed_course_type: form.courseType as StaffPreRegistrationRequest['proposed_course_type'],
    proposed_course_description: form.courseDescription.trim(),
  }
}

export async function registerTeacher(form: TeacherRegistrationForm) {
  return staffPreRegistration(buildStaffPreRegistrationPayload(form))
}

export function getTeacherRegistrationErrorMessage(error: unknown) {
  if (error instanceof AuthApiError) {
    return error.message
  }
  return 'Не удалось отправить регистрацию. Попробуйте ещё раз.'
}

export const TEACHER_COURSE_TYPE_OPTIONS = [
  { value: 'Author', label: 'Авторский' },
  { value: 'Olympiad', label: 'Олимпиадный' },
] as const

export const TEACHER_STUDY_YEAR_OPTIONS = [
  { value: '1', label: '1 курс' },
  { value: '2', label: '2 курс' },
  { value: '3', label: '3 курс' },
  { value: '4', label: '4 курс' },
  { value: '5', label: '5 курс' },
  { value: '6', label: '6 курс' },
] as const

export { DESCRIPTION_MAX_LENGTH }
