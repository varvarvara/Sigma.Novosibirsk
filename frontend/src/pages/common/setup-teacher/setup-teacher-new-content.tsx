import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AuthStarPanel } from '../../../features/auth/ui/auth-star-panel'
import { ChevronDown } from '@untitledui/icons/ChevronDown'
import { validateBirthDateLive } from '../../../features/auth/birth-date-validation'
import { RegistrationConsentText } from '../../../features/auth/ui/registration-consent-text'
import {
  DESCRIPTION_MAX_LENGTH,
  TEACHER_COURSE_TYPE_OPTIONS,
  TEACHER_STUDY_YEAR_OPTIONS,
  getTeacherRegistrationErrorMessage,
  registerTeacher,
  validateTeacherRegistration,
  type TeacherRegistrationErrors,
} from '../../../features/auth/teacher-registration'
import '../../../styles/field-error.css'
import './setup-teacher-styles.css'

type ErrorField = keyof TeacherRegistrationErrors

const BIRTH_FIELD_NAMES = new Set(['birthDay', 'birthMonth', 'birthYear'])

function FieldErrorMessage({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null
  }

  return (
    <p className="field-error" id={id}>
      {message}
    </p>
  )
}

function controlClass(hasError: boolean, extraClass = '') {
  return ['setup-teacher-control', extraClass, hasError ? 'field-input--error' : ''].filter(Boolean).join(' ')
}

export default function SetupTeacherNewPageContent() {
  const navigate = useNavigate()
  const [consentChecked, setConsentChecked] = useState(false)
  const [errors, setErrors] = useState<TeacherRegistrationErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    phone: '',
    email: '',
    social: '',
    university: '',
    direction: '',
    studyYear: '',
    courseName: '',
    courseType: '',
    courseDescription: '',
  })

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev }

      if (fieldName in next) {
        delete next[fieldName as ErrorField]
      }

      if (BIRTH_FIELD_NAMES.has(fieldName)) {
        delete next.birthDate
      }

      if (fieldName === 'consent') {
        delete next.consent
      }

      return next
    })
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    clearFieldError(name)
    setFormError(null)
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

  const handleBirthDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const maxLength = name === 'birthYear' ? 4 : 2
    const nextValue = value.replace(/\D/g, '').slice(0, maxLength)
    const nextDay = name === 'birthDay' ? nextValue : formData.birthDay
    const nextMonth = name === 'birthMonth' ? nextValue : formData.birthMonth
    const nextYear = name === 'birthYear' ? nextValue : formData.birthYear

    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    updateBirthDateFieldError(nextDay, nextMonth, nextYear)
    setFormError(null)
  }

  const handleBirthDateBlur = () => {
    updateBirthDateFieldError(formData.birthDay, formData.birthMonth, formData.birthYear)
  }

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    let digits = value.replace(/\D/g, '')

    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.substring(1)
    }

    if (digits.length === 0) {
      setFormData((prev) => ({ ...prev, [name]: '' }))
      clearFieldError(name)
      setFormError(null)
      return
    }

    let formatted = '+7 '
    if (digits.length > 0) {
      formatted += '(' + digits.substring(0, 3)
    }
    if (digits.length >= 4) {
      formatted += ')-' + digits.substring(3, 6)
    }
    if (digits.length >= 7) {
      formatted += '-' + digits.substring(6, 8)
    }
    if (digits.length >= 9) {
      formatted += '-' + digits.substring(8, 10)
    }

    setFormData((prev) => ({ ...prev, [name]: formatted }))
    clearFieldError(name)
    setFormError(null)
  }

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value.slice(0, DESCRIPTION_MAX_LENGTH)
    setFormData((prev) => ({ ...prev, courseDescription: value }))
    clearFieldError('courseDescription')
    setFormError(null)
  }

  const handleConsentChange = (checked: boolean) => {
    setConsentChecked(checked)
    if (checked) {
      clearFieldError('consent')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const nextErrors = validateTeacherRegistration(formData, { consentAccepted: consentChecked })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await registerTeacher(formData)
      navigate({ to: '/setup-teacher/success' })
    } catch (error) {
      setFormError(getTeacherRegistrationErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const descriptionLength = formData.courseDescription.length

  return (
    <div className="setup-teacher-container">
      <div className="setup-teacher-left">
        <div className="setup-teacher-content">
          <h1 className="setup-teacher-title">Зарегистрироваться</h1>

          <form onSubmit={handleSubmit} className="setup-teacher-form" noValidate>
            {formError ? <p className="field-error setup-teacher-form-error">{formError}</p> : null}

            <section className="setup-teacher-section">
              <h2 className="setup-teacher-subtitle">Личная информация</h2>
              <div className="setup-teacher-grid">
                <div className="setup-teacher-input-group">
                  <label htmlFor="teacher-firstName">Имя</label>
                  <input
                    id="teacher-firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={controlClass(Boolean(errors.firstName))}
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'teacher-first-name-error' : undefined}
                  />
                  <FieldErrorMessage id="teacher-first-name-error" message={errors.firstName} />
                </div>

                <div className="setup-teacher-input-group">
                  <label htmlFor="teacher-lastName">Фамилия</label>
                  <input
                    id="teacher-lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={controlClass(Boolean(errors.lastName))}
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'teacher-last-name-error' : undefined}
                  />
                  <FieldErrorMessage id="teacher-last-name-error" message={errors.lastName} />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-patronymic">Отчество</label>
                  <input
                    id="teacher-patronymic"
                    name="patronymic"
                    type="text"
                    value={formData.patronymic}
                    onChange={handleChange}
                    className={controlClass(false)}
                  />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label>Дата рождения</label>
                  <div className="setup-teacher-date-row">
                    <input
                      name="birthDay"
                      type="text"
                      inputMode="numeric"
                      value={formData.birthDay}
                      onChange={handleBirthDateChange}
                      onBlur={handleBirthDateBlur}
                      placeholder="DD"
                      maxLength={2}
                      className={controlClass(Boolean(errors.birthDate))}
                      aria-invalid={errors.birthDate ? 'true' : 'false'}
                    />
                    <input
                      name="birthMonth"
                      type="text"
                      inputMode="numeric"
                      value={formData.birthMonth}
                      onChange={handleBirthDateChange}
                      onBlur={handleBirthDateBlur}
                      placeholder="MM"
                      maxLength={2}
                      className={controlClass(Boolean(errors.birthDate))}
                      aria-invalid={errors.birthDate ? 'true' : 'false'}
                    />
                    <input
                      name="birthYear"
                      type="text"
                      inputMode="numeric"
                      value={formData.birthYear}
                      onChange={handleBirthDateChange}
                      onBlur={handleBirthDateBlur}
                      placeholder="YYYY"
                      maxLength={4}
                      className={controlClass(Boolean(errors.birthDate))}
                      aria-invalid={errors.birthDate ? 'true' : 'false'}
                      aria-describedby={errors.birthDate ? 'teacher-birth-date-error' : undefined}
                    />
                  </div>
                  <FieldErrorMessage id="teacher-birth-date-error" message={errors.birthDate} />
                </div>
              </div>
            </section>

            <section className="setup-teacher-section">
              <h2 className="setup-teacher-subtitle">Контакты</h2>
              <div className="setup-teacher-grid">
                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-phone">Номер телефона</label>
                  <input
                    id="teacher-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (XXX)-XXX-XX-XX"
                    className={controlClass(Boolean(errors.phone))}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    aria-describedby={errors.phone ? 'teacher-phone-error' : undefined}
                  />
                  <FieldErrorMessage id="teacher-phone-error" message={errors.phone} />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-email">Email</label>
                  <input
                    id="teacher-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={controlClass(Boolean(errors.email))}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'teacher-email-error' : undefined}
                  />
                  <FieldErrorMessage id="teacher-email-error" message={errors.email} />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-social">Ник в ТГ / ВК</label>
                  <input
                    id="teacher-social"
                    name="social"
                    type="text"
                    value={formData.social}
                    onChange={handleChange}
                    className={controlClass(false)}
                  />
                </div>
              </div>
            </section>

            <section className="setup-teacher-section">
              <h2 className="setup-teacher-subtitle">Место обучения</h2>
              <div className="setup-teacher-grid">
                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-university">Университет</label>
                  <input
                    id="teacher-university"
                    name="university"
                    type="text"
                    value={formData.university}
                    onChange={handleChange}
                    className={controlClass(Boolean(errors.university))}
                    aria-invalid={errors.university ? 'true' : 'false'}
                    aria-describedby={errors.university ? 'teacher-university-error' : undefined}
                  />
                  <FieldErrorMessage id="teacher-university-error" message={errors.university} />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-direction">Направление</label>
                  <input
                    id="teacher-direction"
                    name="direction"
                    type="text"
                    value={formData.direction}
                    onChange={handleChange}
                    className={controlClass(Boolean(errors.direction))}
                    aria-invalid={errors.direction ? 'true' : 'false'}
                    aria-describedby={errors.direction ? 'teacher-direction-error' : undefined}
                  />
                  <FieldErrorMessage id="teacher-direction-error" message={errors.direction} />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-studyYear">Курс обучения</label>
                  <div className="setup-teacher-select-wrap">
                    <select
                      id="teacher-studyYear"
                      name="studyYear"
                      value={formData.studyYear}
                      onChange={handleChange}
                      className={controlClass(
                        Boolean(errors.studyYear),
                        formData.studyYear ? '' : 'setup-teacher-select--empty',
                      )}
                      aria-invalid={errors.studyYear ? 'true' : 'false'}
                      aria-describedby={errors.studyYear ? 'teacher-study-year-error' : undefined}
                    >
                      <option value="" disabled hidden>
                        Выберите
                      </option>
                      {TEACHER_STUDY_YEAR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="setup-teacher-select-icon" size={16} color="#2A2730" aria-hidden />
                  </div>
                  <FieldErrorMessage id="teacher-study-year-error" message={errors.studyYear} />
                </div>
              </div>
            </section>

            <section className="setup-teacher-section">
              <h2 className="setup-teacher-subtitle">Информация о курсе</h2>
              <div className="setup-teacher-grid">
                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-courseName">Название курса</label>
                  <input
                    id="teacher-courseName"
                    name="courseName"
                    type="text"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="Биология"
                    className={controlClass(Boolean(errors.courseName))}
                    aria-invalid={errors.courseName ? 'true' : 'false'}
                    aria-describedby={errors.courseName ? 'teacher-course-name-error' : undefined}
                  />
                  <FieldErrorMessage id="teacher-course-name-error" message={errors.courseName} />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-courseType">Тип курса</label>
                  <div className="setup-teacher-select-wrap">
                    <select
                      id="teacher-courseType"
                      name="courseType"
                      value={formData.courseType}
                      onChange={handleChange}
                      className={controlClass(
                        Boolean(errors.courseType),
                        formData.courseType ? '' : 'setup-teacher-select--empty',
                      )}
                      aria-invalid={errors.courseType ? 'true' : 'false'}
                      aria-describedby={errors.courseType ? 'teacher-course-type-error' : undefined}
                    >
                      <option value="" disabled hidden>
                        Выберите
                      </option>
                      {TEACHER_COURSE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="setup-teacher-select-icon" size={16} color="#2A2730" aria-hidden />
                  </div>
                  <FieldErrorMessage id="teacher-course-type-error" message={errors.courseType} />
                </div>

                <div className="setup-teacher-input-group full-width">
                  <label htmlFor="teacher-courseDescription">Описание</label>
                  <textarea
                    id="teacher-courseDescription"
                    name="courseDescription"
                    value={formData.courseDescription}
                    onChange={handleDescriptionChange}
                    className={`${controlClass(Boolean(errors.courseDescription))} setup-teacher-control--textarea`}
                    aria-invalid={errors.courseDescription ? 'true' : 'false'}
                    aria-describedby={errors.courseDescription ? 'teacher-course-description-error' : undefined}
                  />
                  <p className="setup-teacher-field-hint" aria-live="polite">
                    {descriptionLength} / {DESCRIPTION_MAX_LENGTH} символов
                  </p>
                  <FieldErrorMessage id="teacher-course-description-error" message={errors.courseDescription} />
                </div>
              </div>
            </section>

            <div className="setup-teacher-consent">
              <label className={`consent-card${errors.consent ? ' consent-card--error' : ''}`}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(event) => handleConsentChange(event.target.checked)}
                  aria-invalid={errors.consent ? 'true' : 'false'}
                  aria-describedby={errors.consent ? 'teacher-consent-error' : undefined}
                />
                <span>
                  <RegistrationConsentText
                    personalDataUrl={import.meta.env.VITE_PERSONAL_DATA_TEACHER_URL}
                  />
                </span>
              </label>
              <FieldErrorMessage id="teacher-consent-error" message={errors.consent} />
            </div>

            <div className="setup-teacher-form-actions">
              <button
                type="submit"
                className={`setup-teacher-button ${consentChecked ? 'is-ready' : ''}`}
                disabled={!consentChecked || isSubmitting}
              >
                {isSubmitting ? 'Отправка…' : 'Завершить регистрацию'}
              </button>

              <p className="setup-teacher-footer">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="setup-teacher-footer-link">
                  Войти
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <AuthStarPanel />
    </div>
  )
}
