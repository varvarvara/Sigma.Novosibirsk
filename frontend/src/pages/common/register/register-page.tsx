import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type FocusEvent,
  type FormEvent,
  type SetStateAction,
} from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { AuthBackButton } from '../../../components/auth/auth-back-button'
import { ChevronDown } from '@untitledui/icons/ChevronDown'
import { Eye } from '@untitledui/icons/Eye'
import { EyeOff } from '@untitledui/icons/EyeOff'
import { AuthApiError, getAuthSession, login, saveAuthTokens } from '../../../entities/auth'
import { signupStudent } from '../../../entities/students/api/profile.api'
import { RegistrationConsentText } from '../../../features/auth/registration-consent-text'
import './register-page.css'

const PHONE_SLOT_POSITIONS = [4, 5, 6, 9, 10, 11, 13, 14, 16, 17] as const
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_BIRTH_YEAR = 1900
const parsedSeasonId = Number(import.meta.env.VITE_DEFAULT_SEASON_ID ?? 1)
const DEFAULT_SEASON_ID = Number.isFinite(parsedSeasonId) && parsedSeasonId > 0 ? parsedSeasonId : 1
const PASSWORD_LOWERCASE_REGEX = /[a-zа-яё]/
const PASSWORD_UPPERCASE_REGEX = /[A-ZА-ЯЁ]/
const STUDENT_PERSONAL_DATA_URL = import.meta.env.VITE_PERSONAL_DATA_STUDENT_URL ?? ''

type RegisterErrorKey =
  | 'email'
  | 'password'
  | 'passwordRepeat'
  | 'firstName'
  | 'lastName'
  | 'middleName'
  | 'birthDate'
  | 'school'
  | 'studentClass'
  | 'address'
  | 'phone'
  | 'social'
  | 'parentName'
  | 'parentPhone'
  | 'consent'

type RegisterErrors = Partial<Record<RegisterErrorKey, string>>

function extractPhoneDigits(rawValue: string) {
  let digits = rawValue.replace(/\D/g, '')

  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1)
  }

  return digits.slice(0, 10)
}

function formatPhoneMask(phoneDigits: string) {
  const maskedDigits = `${phoneDigits}${'X'.repeat(10)}`.slice(0, 10)
  const area = maskedDigits.slice(0, 3)
  const first = maskedDigits.slice(3, 6)
  const second = maskedDigits.slice(6, 8)
  const third = maskedDigits.slice(8, 10)

  return `+7 (${area}) ${first}-${second}-${third}`
}

function getSlotIndexFromCaret(caretPosition: number) {
  let slotIndex = 0

  for (const position of PHONE_SLOT_POSITIONS) {
    if (caretPosition > position) {
      slotIndex += 1
    }
  }

  return slotIndex
}

function getCaretPositionFromSlotIndex(slotIndex: number) {
  if (slotIndex <= 0) {
    return PHONE_SLOT_POSITIONS[0]
  }

  if (slotIndex >= PHONE_SLOT_POSITIONS.length) {
    return PHONE_SLOT_POSITIONS[PHONE_SLOT_POSITIONS.length - 1] + 1
  }

  return PHONE_SLOT_POSITIONS[slotIndex]
}

function placePhoneCaret(input: HTMLInputElement, slotIndex: number) {
  const safeSlotIndex = Math.max(0, Math.min(slotIndex, PHONE_SLOT_POSITIONS.length))
  const nextCaretPosition = getCaretPositionFromSlotIndex(safeSlotIndex)
  input.setSelectionRange(nextCaretPosition, nextCaretPosition)
}

function validateBirthDate(day: string, month: string, year: string) {
  const d = day.trim()
  const m = month.trim()
  const y = year.trim()
  const currentYear = new Date().getFullYear()

  if (!d || !m || !y) {
    return 'Укажите полную дату рождения.'
  }

  if (!/^\d{2}$/.test(d) || !/^\d{2}$/.test(m) || !/^\d{4}$/.test(y)) {
    return 'Формат даты: DD.MM.YYYY.'
  }

  const dayNumber = Number(d)
  const monthNumber = Number(m)
  const yearNumber = Number(y)

  if (dayNumber < 1 || dayNumber > 31) {
    return 'День должен быть от 1 до 31.'
  }

  if (monthNumber < 1 || monthNumber > 12) {
    return 'Месяц должен быть от 1 до 12.'
  }

  if (yearNumber < MIN_BIRTH_YEAR || yearNumber > currentYear) {
    return `Год должен быть от ${MIN_BIRTH_YEAR} до ${currentYear}.`
  }

  const date = new Date(yearNumber, monthNumber - 1, dayNumber)

  if (
    date.getFullYear() !== yearNumber ||
    date.getMonth() !== monthNumber - 1 ||
    date.getDate() !== dayNumber
  ) {
    return 'Введите корректную дату рождения.'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date > today) {
    return 'Дата рождения не может быть в будущем.'
  }

  return null
}

function validateBirthDateLive(day: string, month: string, year: string) {
  const d = day.trim()
  const m = month.trim()
  const y = year.trim()
  const currentYear = new Date().getFullYear()

  if (!d && !m && !y) {
    return null
  }

  if (d.length === 2) {
    const dayNumber = Number(d)
    if (dayNumber < 1 || dayNumber > 31) {
      return 'День должен быть от 1 до 31.'
    }
  }

  if (m.length === 2) {
    const monthNumber = Number(m)
    if (monthNumber < 1 || monthNumber > 12) {
      return 'Месяц должен быть от 1 до 12.'
    }
  }

  if (y.length === 4) {
    const yearNumber = Number(y)
    if (yearNumber < MIN_BIRTH_YEAR || yearNumber > currentYear) {
      return `Год должен быть от ${MIN_BIRTH_YEAR} до ${currentYear}.`
    }
  }

  if (d.length === 2 && m.length === 2 && y.length === 4) {
    return validateBirthDate(d, m, y)
  }

  return null
}

function getHomePathBySession() {
  const session = getAuthSession()
  if (!session) {
    return '/profile'
  }
  if (session.userType === 'student') {
    return '/profile'
  }
  if (session.staffRole === 'Admin') {
    return '/org-extracurricular'
  }
  return '/schedule'
}

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedRole = (location.state as { role?: string } | undefined)?.role ?? 'student'
  const [studentClass, setStudentClass] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [studentPhoneDigits, setStudentPhoneDigits] = useState('')
  const [parentPhoneDigits, setParentPhoneDigits] = useState('')
  const [isConsentAccepted, setIsConsentAccepted] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const clearFieldError = (field: RegisterErrorKey) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev
      }

      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handlePhoneInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setPhoneDigits: Dispatch<SetStateAction<string>>,
  ) => {
    const input = event.target
    const currentCaretPosition = input.selectionStart ?? input.value.length
    const targetSlotIndex = getSlotIndexFromCaret(currentCaretPosition)
    const nextDigits = extractPhoneDigits(input.value)

    setPhoneDigits(nextDigits)

    requestAnimationFrame(() => {
      if (document.activeElement !== input) {
        return
      }

      placePhoneCaret(input, Math.min(targetSlotIndex, nextDigits.length))
    })
  }

  const handlePhoneFocus = (event: FocusEvent<HTMLInputElement>, digitsCount: number) => {
    const input = event.currentTarget
    requestAnimationFrame(() => {
      if (document.activeElement !== input) {
        return
      }

      placePhoneCaret(input, digitsCount)
    })
  }

  const getInputClassName = (field: RegisterErrorKey, extraClass = '') => {
    const classes = ['register-page__input']
    if (extraClass) {
      classes.push(extraClass)
    }
    if (errors[field]) {
      classes.push('register-page__input--error')
    }
    return classes.join(' ')
  }

  const updateBirthDateFieldError = (day: string, month: string, year: string) => {
    setErrors((prev) => {
      const next = { ...prev }
      const birthDateError = validateBirthDateLive(day, month, year)

      if (birthDateError) {
        next.birthDate = birthDateError
      } else {
        delete next.birthDate
      }

      return next
    })
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setSubmitError('')
    const formData = new FormData(event.currentTarget)
    const nextErrors: RegisterErrors = {}

    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const passwordRepeat = String(formData.get('passwordRepeat') ?? '')
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const middleName = String(formData.get('middleName') ?? '').trim()
    const school = String(formData.get('school') ?? '').trim()
    const address = String(formData.get('address') ?? '').trim()
    const social = String(formData.get('social') ?? '').trim()
    const parentName = String(formData.get('parentName') ?? '').trim()

    if (!email) {
      nextErrors.email = 'Заполните поле.'
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = 'Введите корректную почту.'
    }

    if (!password) {
      nextErrors.password = 'Заполните поле.'
    } else if (password.length < 8) {
      nextErrors.password = 'Минимум 8 символов.'
    } else if (!PASSWORD_LOWERCASE_REGEX.test(password) || !PASSWORD_UPPERCASE_REGEX.test(password)) {
      nextErrors.password = 'Нужны строчные и заглавные буквы.'
    }

    if (!passwordRepeat) {
      nextErrors.passwordRepeat = 'Заполните поле.'
    } else if (password !== passwordRepeat) {
      nextErrors.passwordRepeat = 'Пароли не совпадают.'
    }

    if (!firstName) nextErrors.firstName = 'Заполните поле.'
    if (!lastName) nextErrors.lastName = 'Заполните поле.'
    if (!middleName) nextErrors.middleName = 'Заполните поле.'

    const birthDateError = validateBirthDate(birthDay, birthMonth, birthYear)
    if (birthDateError) {
      nextErrors.birthDate = birthDateError
    }

    if (!school) nextErrors.school = 'Заполните поле.'
    if (!studentClass) nextErrors.studentClass = 'Выберите класс.'
    if (!address) nextErrors.address = 'Заполните поле.'

    if (studentPhoneDigits.length < 10) {
      nextErrors.phone = 'Введите номер полностью.'
    }

    if (!social) nextErrors.social = 'Заполните поле.'
    if (!parentName) nextErrors.parentName = 'Заполните поле.'

    if (parentPhoneDigits.length < 10) {
      nextErrors.parentPhone = 'Введите номер полностью.'
    }

    if (!isConsentAccepted) {
      nextErrors.consent = 'Подтвердите согласие на обработку персональных данных.'
    }

    if (selectedRole !== 'student') {
      setSubmitError('Сейчас подключена регистрация только ученика.')
      return
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await signupStudent({
        first_name: firstName,
        last_name: lastName,
        partonymic: middleName || null,
        email,
        phone: `+7${studentPhoneDigits}`,
        tg_nickname: social || null,
        year_of_study: Number(studentClass),
        city: address || null,
        school: school || null,
        parent_name: parentName,
        parent_phone: `+7${parentPhoneDigits}`,
        password,
        season_id: DEFAULT_SEASON_ID,
      })

      const tokens = await login({ email, password })
      saveAuthTokens(tokens)
      navigate({ to: getHomePathBySession() })
    } catch (error) {
      if (error instanceof AuthApiError) {
        setSubmitError(error.message)
      } else {
        setSubmitError('Не удалось отправить регистрацию. Попробуйте ещё раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="register-page">
      <AuthBackButton
        fallback={{ to: '/role', search: { intent: 'register' } }}
        className="register-page__back app-back-button"
      />

      <section className="register-page__content">
        <h1 className="register-page__title">Регистрация</h1>
        <p className="register-page__subtitle">
          Есть аккаунт?
          <button
            type="button"
            className="register-page__link"
            onClick={() => navigate({ to: '/login' })}
          >
            Зайти в аккаунт
          </button>
        </p>
      </section>

      <form className="register-page__form" onSubmit={handleRegisterSubmit} noValidate>
        <h2 className="register-page__section-title">Настройка аккаунта</h2>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-email">
            Почта
          </label>
          <input
            className={getInputClassName('email')}
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            onChange={() => clearFieldError('email')}
          />
          {errors.email ? (
            <p className="register-page__error" id="reg-email-error">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-password">
            Пароль
          </label>
          <div className="register-page__password-wrap">
            <input
              className={getInputClassName('password', 'register-page__input--with-icon')}
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'reg-password-error' : undefined}
              onChange={() => clearFieldError('password')}
            />
            <button
              type="button"
              className="register-page__password-toggle"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={16} color="#2A2730" /> : <Eye size={16} color="#2A2730" />}
            </button>
          </div>
          {errors.password ? (
            <p className="register-page__error" id="reg-password-error">
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-password-repeat">
            Повторите пароль
          </label>
          <div className="register-page__password-wrap">
            <input
              className={getInputClassName('passwordRepeat', 'register-page__input--with-icon')}
              id="reg-password-repeat"
              name="passwordRepeat"
              type={showRepeatPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={errors.passwordRepeat ? 'true' : 'false'}
              aria-describedby={errors.passwordRepeat ? 'reg-password-repeat-error' : undefined}
              onChange={() => clearFieldError('passwordRepeat')}
            />
            <button
              type="button"
              className="register-page__password-toggle"
              aria-label={showRepeatPassword ? 'Скрыть повтор пароля' : 'Показать повтор пароля'}
              onClick={() => setShowRepeatPassword((prev) => !prev)}
            >
              {showRepeatPassword ? <EyeOff size={16} color="#2A2730" /> : <Eye size={16} color="#2A2730" />}
            </button>
          </div>
          {errors.passwordRepeat ? (
            <p className="register-page__error" id="reg-password-repeat-error">
              {errors.passwordRepeat}
            </p>
          ) : null}
        </div>

        <h2 className="register-page__section-title register-page__section-title--spaced">
          Личная информация
        </h2>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-first-name">
            Имя
          </label>
          <input
            className={getInputClassName('firstName')}
            id="reg-first-name"
            name="firstName"
            type="text"
            aria-invalid={errors.firstName ? 'true' : 'false'}
            aria-describedby={errors.firstName ? 'reg-first-name-error' : undefined}
            onChange={() => clearFieldError('firstName')}
          />
          {errors.firstName ? (
            <p className="register-page__error" id="reg-first-name-error">
              {errors.firstName}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-last-name">
            Фамилия
          </label>
          <input
            className={getInputClassName('lastName')}
            id="reg-last-name"
            name="lastName"
            type="text"
            aria-invalid={errors.lastName ? 'true' : 'false'}
            aria-describedby={errors.lastName ? 'reg-last-name-error' : undefined}
            onChange={() => clearFieldError('lastName')}
          />
          {errors.lastName ? (
            <p className="register-page__error" id="reg-last-name-error">
              {errors.lastName}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-middle-name">
            Отчество
          </label>
          <input
            className={getInputClassName('middleName')}
            id="reg-middle-name"
            name="middleName"
            type="text"
            aria-invalid={errors.middleName ? 'true' : 'false'}
            aria-describedby={errors.middleName ? 'reg-middle-name-error' : undefined}
            onChange={() => clearFieldError('middleName')}
          />
          {errors.middleName ? (
            <p className="register-page__error" id="reg-middle-name-error">
              {errors.middleName}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label">Дата рождения</label>
          <div className="register-page__date-row">
            <input
              className={getInputClassName('birthDate', 'register-page__input--date')}
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="DD"
              value={birthDay}
              onChange={(event) => {
                const nextDay = event.target.value.replace(/\D/g, '').slice(0, 2)
                setBirthDay(nextDay)
                updateBirthDateFieldError(nextDay, birthMonth, birthYear)
              }}
              onBlur={() => updateBirthDateFieldError(birthDay, birthMonth, birthYear)}
            />
            <input
              className={getInputClassName('birthDate', 'register-page__input--date')}
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="MM"
              value={birthMonth}
              onChange={(event) => {
                const nextMonth = event.target.value.replace(/\D/g, '').slice(0, 2)
                setBirthMonth(nextMonth)
                updateBirthDateFieldError(birthDay, nextMonth, birthYear)
              }}
              onBlur={() => updateBirthDateFieldError(birthDay, birthMonth, birthYear)}
            />
            <input
              className={getInputClassName('birthDate', 'register-page__input--date')}
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="YYYY"
              value={birthYear}
              onChange={(event) => {
                const nextYear = event.target.value.replace(/\D/g, '').slice(0, 4)
                setBirthYear(nextYear)
                updateBirthDateFieldError(birthDay, birthMonth, nextYear)
              }}
              onBlur={() => updateBirthDateFieldError(birthDay, birthMonth, birthYear)}
            />
          </div>
          {errors.birthDate ? <p className="register-page__error">{errors.birthDate}</p> : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-school">
            Место обучения
          </label>
          <input
            className={getInputClassName('school')}
            id="reg-school"
            name="school"
            type="text"
            aria-invalid={errors.school ? 'true' : 'false'}
            aria-describedby={errors.school ? 'reg-school-error' : undefined}
            onChange={() => clearFieldError('school')}
          />
          {errors.school ? (
            <p className="register-page__error" id="reg-school-error">
              {errors.school}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-class">
            Класс (на 2026-2027 учебный год)
          </label>
          <div className="register-page__select-wrap">
            <select
              className={getInputClassName('studentClass', 'register-page__select')}
              id="reg-class"
              name="studentClass"
              value={studentClass}
              aria-invalid={errors.studentClass ? 'true' : 'false'}
              aria-describedby={errors.studentClass ? 'reg-class-error' : undefined}
              onChange={(event) => {
                setStudentClass(event.target.value)
                clearFieldError('studentClass')
              }}
            >
              <option value="">Выберите класс</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
            </select>
            <ChevronDown className="register-page__select-icon" size={16} color="#2A2730" />
          </div>
          {errors.studentClass ? (
            <p className="register-page__error" id="reg-class-error">
              {errors.studentClass}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-address">
            Адрес проживания
          </label>
          <input
            className={getInputClassName('address')}
            id="reg-address"
            name="address"
            type="text"
            aria-invalid={errors.address ? 'true' : 'false'}
            aria-describedby={errors.address ? 'reg-address-error' : undefined}
            onChange={() => clearFieldError('address')}
          />
          {errors.address ? (
            <p className="register-page__error" id="reg-address-error">
              {errors.address}
            </p>
          ) : null}
        </div>

        <h2 className="register-page__section-title register-page__section-title--spaced">Контакты</h2>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-phone">
            Номер телефона
          </label>
          <input
            className={getInputClassName('phone', 'register-page__input--phone')}
            id="reg-phone"
            name="phone"
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            value={formatPhoneMask(studentPhoneDigits)}
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
            onChange={(event) => {
              handlePhoneInputChange(event, setStudentPhoneDigits)
              clearFieldError('phone')
            }}
            onFocus={(event) => handlePhoneFocus(event, studentPhoneDigits.length)}
          />
          {errors.phone ? (
            <p className="register-page__error" id="reg-phone-error">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-social">
            Ник в Telegram / Вконтакте
          </label>
          <input
            className={getInputClassName('social')}
            id="reg-social"
            name="social"
            type="text"
            aria-invalid={errors.social ? 'true' : 'false'}
            aria-describedby={errors.social ? 'reg-social-error' : undefined}
            onChange={() => clearFieldError('social')}
          />
          {errors.social ? (
            <p className="register-page__error" id="reg-social-error">
              {errors.social}
            </p>
          ) : null}
        </div>

        <h2 className="register-page__section-title register-page__section-title--spaced">
          Информация о родителе / опекуне
        </h2>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-parent-name">
            ФИО родителя / опекуна
          </label>
          <input
            className={getInputClassName('parentName')}
            id="reg-parent-name"
            name="parentName"
            type="text"
            aria-invalid={errors.parentName ? 'true' : 'false'}
            aria-describedby={errors.parentName ? 'reg-parent-name-error' : undefined}
            onChange={() => clearFieldError('parentName')}
          />
          {errors.parentName ? (
            <p className="register-page__error" id="reg-parent-name-error">
              {errors.parentName}
            </p>
          ) : null}
        </div>

        <div className="register-page__field">
          <label className="register-page__label" htmlFor="reg-parent-phone">
            Номер телефона родителя / опекуна
          </label>
          <input
            className={getInputClassName('parentPhone', 'register-page__input--phone')}
            id="reg-parent-phone"
            name="parentPhone"
            type="text"
            inputMode="numeric"
            autoComplete="tel"
            value={formatPhoneMask(parentPhoneDigits)}
            aria-invalid={errors.parentPhone ? 'true' : 'false'}
            aria-describedby={errors.parentPhone ? 'reg-parent-phone-error' : undefined}
            onChange={(event) => {
              handlePhoneInputChange(event, setParentPhoneDigits)
              clearFieldError('parentPhone')
            }}
            onFocus={(event) => handlePhoneFocus(event, parentPhoneDigits.length)}
          />
          {errors.parentPhone ? (
            <p className="register-page__error" id="reg-parent-phone-error">
              {errors.parentPhone}
            </p>
          ) : null}
        </div>

        <div
          className={`register-page__consent${errors.consent ? ' register-page__consent--error' : ''}`}
        >
          <label className="register-page__consent-label" htmlFor="reg-consent">
            <input
              className="register-page__consent-checkbox"
              id="reg-consent"
              name="consent"
              type="checkbox"
              checked={isConsentAccepted}
              aria-invalid={errors.consent ? 'true' : 'false'}
              aria-describedby={errors.consent ? 'reg-consent-error' : undefined}
              onChange={(event) => {
                setIsConsentAccepted(event.target.checked)
                clearFieldError('consent')
              }}
            />
            <span className="register-page__consent-text">
              <RegistrationConsentText personalDataUrl={STUDENT_PERSONAL_DATA_URL} />
            </span>
          </label>
        </div>
        {errors.consent ? (
          <p className="register-page__error" id="reg-consent-error">
            {errors.consent}
          </p>
        ) : null}

        {submitError ? <p className="register-page__error">{submitError}</p> : null}

        <button type="submit" className="register-page__submit" disabled={isSubmitting}>
          Зарегистрироваться
        </button>
      </form>
    </main>
  )
}
