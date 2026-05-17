import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { AuthBackButton } from '../../../components/auth/auth-back-button'
import { Eye } from '@untitledui/icons/Eye'
import { EyeOff } from '@untitledui/icons/EyeOff'
import { AuthStarPanel } from '../../../components/auth/auth-star-panel'
import { isMobileAuthViewport, navigateToRegistration } from '../../../features/auth/auth-flow'
import {
  AuthApiError,
  getAuthSession,
  getRememberMePreference,
  getRememberedEmail,
  login,
  saveAuthTokens,
  saveRememberedEmail,
} from '../../../api/auth'
import '../../../components/auth/auth-split-layout.css'
import '../../../styles/field-error.css'
import './login-page.css'

const EMPTY_FIELD_MESSAGE = 'Заполните поле.'

type LoginFieldErrors = {
  email?: string
  password?: string
}

function loginInputClass(hasError: boolean, extraClass = '') {
  return ['login-page__input', extraClass, hasError ? 'field-input--error' : ''].filter(Boolean).join(' ')
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
  return '/teacher/profile'
}

type LoginFormProps = {
  variant: 'mobile' | 'desktop'
  rememberMe: boolean
  setRememberMe: (value: boolean) => void
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  showPassword: boolean
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void
  isSubmitting: boolean
  errorMessage: string
  fieldErrors: LoginFieldErrors
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onForgotPassword: () => void
  onRegister: () => void
}

function LoginForm({
  variant,
  rememberMe,
  setRememberMe,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isSubmitting,
  errorMessage,
  fieldErrors,
  onSubmit,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  const isMobile = variant === 'mobile'
  const emailLabel = isMobile ? 'Логин' : 'Email'
  const emailId = 'login-email'

  return (
    <div className={`login-page__panel login-page__panel--${variant}`}>
      {isMobile ? (
        <AuthBackButton
          fallback={{ to: '/role', search: { intent: 'login' } }}
          className="login-page__back app-back-button"
        />
      ) : null}

      <header className="login-page__header">
        <h1 className="login-page__title">{isMobile ? 'Войти в аккаунт' : 'Войти'}</h1>
        <p className="login-page__subtitle">
          {isMobile
            ? 'Введите данные для входа в аккаунт'
            : 'Рады вашему возвращению! Заполните данные ниже'}
        </p>
      </header>

      <form className="login-page__form" onSubmit={onSubmit} noValidate>
        <div className="login-page__field">
          <label className="login-page__label" htmlFor={emailId}>
            {emailLabel}
          </label>
          <input
            className={loginInputClass(Boolean(fieldErrors.email))}
            id={emailId}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
          />
          {fieldErrors.email ? (
            <p className="field-error" id="login-email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="login-page__field">
          <label className="login-page__label" htmlFor="login-password">
            Пароль
          </label>
          <div className="login-page__password-wrap">
            <input
              className={loginInputClass(Boolean(fieldErrors.password), 'login-page__input--with-icon')}
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={fieldErrors.password ? 'true' : 'false'}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            />
            <button
              type="button"
              className="login-page__password-toggle"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={16} color="#2A2730" /> : <Eye size={16} color="#2A2730" />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className="field-error" id="login-password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {isMobile ? (
          <label className="login-page__remember">
            <input
              className="login-page__checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Запомнить меня</span>
          </label>
        ) : (
          <button type="button" className="login-page__forgot login-page__forgot--inline" onClick={onForgotPassword}>
            Забыл пароль
          </button>
        )}

        {errorMessage ? <p className="field-error">{errorMessage}</p> : null}

        <div className="login-page__form-actions">
          <button type="submit" className="login-page__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>

          {isMobile ? (
            <button type="button" className="login-page__forgot login-page__forgot--centered" onClick={onForgotPassword}>
              Забыли пароль?
            </button>
          ) : (
            <p className="login-page__register">
              Нет аккаунта?{' '}
              <button type="button" className="login-page__register-link" onClick={onRegister}>
                Зарегистрироваться
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = isMobileAuthViewport()
  const [rememberMe, setRememberMe] = useState(() => getRememberMePreference())
  const [email, setEmail] = useState(() => getRememberedEmail())
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})

  useEffect(() => {
    if (!email && getRememberMePreference()) {
      setEmail(getRememberedEmail())
    }
  }, [email])

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const nextFieldErrors: LoginFieldErrors = {}
    if (!email.trim()) {
      nextFieldErrors.email = EMPTY_FIELD_MESSAGE
    }
    if (!password) {
      nextFieldErrors.password = EMPTY_FIELD_MESSAGE
    }

    if (nextFieldErrors.email || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors)
      setErrorMessage('')
      return
    }

    setFieldErrors({})
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const normalizedEmail = email.trim()
      const tokens = await login({
        email: normalizedEmail,
        password,
        remember_me: rememberMe,
      })
      saveAuthTokens(tokens, rememberMe)
      saveRememberedEmail(normalizedEmail, rememberMe)
      navigate({ to: getHomePathBySession() })
    } catch (error) {
      if (error instanceof AuthApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Не удалось выполнить вход. Попробуйте ещё раз.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.email
        return next
      })
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.password
        return next
      })
    }
  }

  const formProps = {
    rememberMe,
    setRememberMe,
    email,
    setEmail: handleEmailChange,
    password,
    setPassword: handlePasswordChange,
    showPassword,
    setShowPassword,
    isSubmitting,
    errorMessage,
    fieldErrors,
    onSubmit: handleLoginSubmit,
    onForgotPassword: () => navigate({ to: '/password-reset' }),
    onRegister: () => navigateToRegistration(navigate, location.state),
  }

  if (isMobile) {
    return (
      <main className="login-page login-page--mobile">
        <LoginForm variant="mobile" {...formProps} />
      </main>
    )
  }

  return (
    <div className="auth-split-layout auth-login-layout">
      <main className="auth-split-layout__main login-page login-page--desktop">
        <LoginForm variant="desktop" {...formProps} />
      </main>
      <AuthStarPanel />
    </div>
  )
}
