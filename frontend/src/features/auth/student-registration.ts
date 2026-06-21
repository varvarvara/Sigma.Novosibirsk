import { AuthApiError, login, saveAuthTokens } from '../../entities/auth';
import { signupStudent } from '../../entities/student/api/profile.api';

import { validateBirthDate } from './birth-date-validation'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_LOWERCASE_REGEX = /[a-zа-яё]/
const PASSWORD_UPPERCASE_REGEX = /[A-ZА-ЯЁ]/

const parsedSeasonId = Number(import.meta.env.VITE_DEFAULT_SEASON_ID ?? 1)
export const DEFAULT_SEASON_ID =
  Number.isFinite(parsedSeasonId) && parsedSeasonId > 0 ? parsedSeasonId : 1

export type StudentRegistrationForm = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  middleName: string
  birthDay: string
  birthMonth: string
  birthYear: string
  school: string
  grade: string
  address: string
  phone: string
  parentPhone: string
  social: string
  parentName: string
}

export type StudentRegistrationErrors = Partial<
  Record<
    | 'email'
    | 'password'
    | 'confirmPassword'
    | 'firstName'
    | 'lastName'
    | 'birthDate'
    | 'school'
    | 'grade'
    | 'address'
    | 'phone'
    | 'parentPhone'
    | 'parentName'
    | 'consent'
    | 'form',
    string
  >
>

export function extractPhoneDigits(rawValue: string) {
  let digits = rawValue.replace(/\D/g, '')
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 10)
}

export function validateStudentRegistration(
  form: StudentRegistrationForm,
  options: { consentAccepted: boolean },
): StudentRegistrationErrors {
  const errors: StudentRegistrationErrors = {}
  const email = form.email.trim()
  const studentPhoneDigits = extractPhoneDigits(form.phone)
  const parentPhoneDigits = extractPhoneDigits(form.parentPhone)

  if (!email) {
    errors.email = 'Заполните поле.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Введите корректную почту.'
  }

  if (!form.password) {
    errors.password = 'Заполните поле.'
  } else if (form.password.length < 8) {
    errors.password = 'Минимум 8 символов.'
  } else if (
    !PASSWORD_LOWERCASE_REGEX.test(form.password) ||
    !PASSWORD_UPPERCASE_REGEX.test(form.password)
  ) {
    errors.password = 'Нужны строчные и заглавные буквы.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Заполните поле.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают.'
  }

  if (!form.firstName.trim()) errors.firstName = 'Заполните поле.'
  if (!form.lastName.trim()) errors.lastName = 'Заполните поле.'

  const birthDateError = validateBirthDate(form.birthDay, form.birthMonth, form.birthYear)
  if (birthDateError) {
    errors.birthDate = birthDateError
  }

  if (!form.school.trim()) errors.school = 'Заполните поле.'
  if (!form.grade) errors.grade = 'Выберите класс.'
  if (!form.address.trim()) errors.address = 'Заполните поле.'

  if (studentPhoneDigits.length < 10) {
    errors.phone = 'Введите номер полностью.'
  }

  if (!form.parentName.trim()) {
    errors.parentName = 'Заполните поле.'
  }

  if (parentPhoneDigits.length < 10) {
    errors.parentPhone = 'Введите номер полностью.'
  }

  if (!options.consentAccepted) {
    errors.consent = 'Подтвердите согласие на обработку персональных данных.'
  }

  return errors
}

export async function registerStudentAndLogin(form: StudentRegistrationForm) {
  const email = form.email.trim()
  const studentPhoneDigits = extractPhoneDigits(form.phone)
  const parentPhoneDigits = extractPhoneDigits(form.parentPhone)

  await signupStudent({
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    partonymic: form.middleName.trim() || null,
    email,
    phone: `+7${studentPhoneDigits}`,
    tg_nickname: form.social.trim() || null,
    year_of_study: Number(form.grade),
    city: form.address.trim() || null,
    school: form.school.trim() || null,
    parent_name: form.parentName.trim(),
    parent_phone: `+7${parentPhoneDigits}`,
    password: form.password,
    season_id: DEFAULT_SEASON_ID,
  })

  const tokens = await login({ email, password: form.password })
  saveAuthTokens(tokens)
}

export function getRegistrationErrorMessage(error: unknown) {
  if (error instanceof AuthApiError) {
    return error.message
  }
  return 'Не удалось отправить регистрацию. Попробуйте ещё раз.'
}
