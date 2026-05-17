import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthBackButton } from '../../../components/auth/auth-back-button'
import { AuthStarPanel } from '../../../components/auth/auth-star-panel'
import { Eye } from '@untitledui/icons/Eye'
import { EyeOff } from '@untitledui/icons/EyeOff'
import {
  AuthApiError,
  confirmPasswordReset,
  requestPasswordReset,
} from '../../../api/auth'
import { isMobileAuthViewport } from '../../../features/auth/auth-flow'
import '../../../components/auth/auth-split-layout.css'
import '../../../styles/field-error.css'
import './password-reset-page.css'

const PASSWORD_LOWERCASE_REGEX = /[a-zа-яё]/
const PASSWORD_UPPERCASE_REGEX = /[A-ZА-ЯЁ]/

function validatePassword(value: string) {
  if (value.length < 8) {
    return 'Минимум 8 символов.'
  }
  if (!PASSWORD_LOWERCASE_REGEX.test(value) || !PASSWORD_UPPERCASE_REGEX.test(value)) {
    return 'Нужны строчные и заглавные буквы.'
  }
  return ''
}

function PasswordResetHelp() {
  return (
    <p className="password-reset-page__help">
      Если у вас возникли проблемы:{' '}
      <a
        className="password-reset-page__help-link"
        href="https://t.me/varya_murash/"
        target="_blank"
        rel="noreferrer"
      >
        напишите нам
      </a>
    </p>
  )
}

type PasswordResetFormProps = {
  variant: 'mobile' | 'desktop'
  isConfirmStep: boolean
  showPasswords: boolean
  setShowPasswords: (value: boolean | ((prev: boolean) => boolean)) => void
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  repeatPassword: string
  setRepeatPassword: (value: string) => void
  errorMessage: string
  infoMessage: string
  isSubmitting: boolean
  onRequestSubmit: (event: FormEvent<HTMLFormElement>) => void
  onConfirmSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function PasswordResetForm({
  variant,
  isConfirmStep,
  showPasswords,
  setShowPasswords,
  email,
  setEmail,
  password,
  setPassword,
  repeatPassword,
  setRepeatPassword,
  errorMessage,
  infoMessage,
  isSubmitting,
  onRequestSubmit,
  onConfirmSubmit,
}: PasswordResetFormProps) {
  const isMobile = variant === 'mobile'

  return (
    <div className={`password-reset-page__panel password-reset-page__panel--${variant}`}>
      {isMobile ? (
        <AuthBackButton
          fallback={{ to: '/login' }}
          className="password-reset-page__back app-back-button"
        />
      ) : null}

      <header className="password-reset-page__header">
        <h1 className="password-reset-page__title">Восстановление пароля</h1>
        <p className="password-reset-page__subtitle">
          {isConfirmStep
            ? 'Придумайте новый надёжный пароль'
            : 'Укажите email — отправим ссылку для сброса пароля'}
        </p>
      </header>

      {isConfirmStep ? (
        <form className="password-reset-page__form" onSubmit={onConfirmSubmit}>
          <div className="password-reset-page__field">
            <label className="password-reset-page__label" htmlFor="new-password">
              Новый пароль
            </label>
            <div className="password-reset-page__password-wrap">
              <input
                id="new-password"
                className="password-reset-page__input password-reset-page__input--with-icon"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="password-reset-page__password-toggle"
                aria-label={showPasswords ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPasswords((prev) => !prev)}
              >
                {showPasswords ? <EyeOff size={16} color="#2A2730" /> : <Eye size={16} color="#2A2730" />}
              </button>
            </div>
          </div>

          <div className="password-reset-page__field">
            <label className="password-reset-page__label" htmlFor="repeat-password">
              Повторите пароль
            </label>
            <div className="password-reset-page__password-wrap">
              <input
                id="repeat-password"
                className="password-reset-page__input password-reset-page__input--with-icon"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="password-reset-page__password-toggle"
                aria-label={showPasswords ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPasswords((prev) => !prev)}
              >
                {showPasswords ? <EyeOff size={16} color="#2A2730" /> : <Eye size={16} color="#2A2730" />}
              </button>
            </div>
          </div>

          {errorMessage ? <p className="field-error">{errorMessage}</p> : null}

          <div className="password-reset-page__form-footer">
            <button type="submit" className="password-reset-page__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
            </button>
            <PasswordResetHelp />
          </div>
        </form>
      ) : (
        <form className="password-reset-page__form" onSubmit={onRequestSubmit}>
          <div className="password-reset-page__field">
            <label className="password-reset-page__label" htmlFor="reset-email">
              Email
            </label>
            <input
              id="reset-email"
              className="password-reset-page__input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {errorMessage ? <p className="field-error">{errorMessage}</p> : null}
          {infoMessage ? <p className="password-reset-page__info">{infoMessage}</p> : null}

          <div className="password-reset-page__form-footer">
            <button type="submit" className="password-reset-page__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Отправляем...' : 'Отправить ссылку'}
            </button>
            <PasswordResetHelp />
          </div>
        </form>
      )}
    </div>
  )
}

export function PasswordResetPage() {
  const navigate = useNavigate()
  const { token } = useSearch({ from: '/password-reset' })
  const isMobile = isMobileAuthViewport()
  const [showPasswords, setShowPasswords] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isConfirmStep = Boolean(token)

  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setErrorMessage('')
    setInfoMessage('')
    setIsSubmitting(true)

    try {
      const response = await requestPasswordReset({ email: email.trim() })
      setInfoMessage(response.message)
    } catch (error) {
      if (error instanceof AuthApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Не удалось отправить запрос. Попробуйте ещё раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || isSubmitting) {
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setErrorMessage(passwordError)
      return
    }
    if (password !== repeatPassword) {
      setErrorMessage('Пароли не совпадают.')
      return
    }

    setErrorMessage('')
    setInfoMessage('')
    setIsSubmitting(true)

    try {
      await confirmPasswordReset({ token, password })
      navigate({ to: '/password-reset/success' })
    } catch (error) {
      if (error instanceof AuthApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Не удалось сохранить пароль. Попробуйте ещё раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formProps: PasswordResetFormProps = {
    variant: isMobile ? 'mobile' : 'desktop',
    isConfirmStep,
    showPasswords,
    setShowPasswords,
    email,
    setEmail,
    password,
    setPassword,
    repeatPassword,
    setRepeatPassword,
    errorMessage,
    infoMessage,
    isSubmitting,
    onRequestSubmit: handleRequestSubmit,
    onConfirmSubmit: handleConfirmSubmit,
  }

  if (isMobile) {
    return (
      <main className="password-reset-page password-reset-page--mobile">
        <PasswordResetForm {...formProps} variant="mobile" />
      </main>
    )
  }

  return (
    <div className="auth-split-layout auth-login-layout">
      <main className="auth-split-layout__main password-reset-page password-reset-page--desktop">
        <PasswordResetForm {...formProps} variant="desktop" />
      </main>
      <AuthStarPanel />
    </div>
  )
}
