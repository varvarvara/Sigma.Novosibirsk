import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from '@untitledui/icons/ChevronLeft'
import './login-page.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(false)

  return (
    <main className="login-page">
      <button
        type="button"
        className="login-page__back app-back-button"
        aria-label="Назад"
        onClick={() => navigate({ to: '/role', state: { authIntent: 'login' } })}
      >
        <ChevronLeft className="app-back-button__icon" size={24} color="#2A2730" />
      </button>

      <section className="login-page__content">
        <h1 className="login-page__title">Войти в аккаунт</h1>
        <p className="login-page__subtitle">
          Нет аккаунта?
          <button
            type="button"
            className="login-page__link"
            onClick={() => navigate({ to: '/register' })}
          >
            Зарегистрироваться
          </button>
        </p>

        <form className="login-page__form" onSubmit={(event) => event.preventDefault()}>
          <div className="login-page__field">
            <label className="login-page__label" htmlFor="login-email">
              Логин
            </label>
            <input className="login-page__input" id="login-email" type="text" autoComplete="username" />
          </div>

          <div className="login-page__field">
            <label className="login-page__label" htmlFor="login-password">
              Пароль
            </label>
            <input
              className="login-page__input"
              id="login-password"
              type="password"
              autoComplete="current-password"
            />
          </div>

          <label className="login-page__remember">
            <input
              className="login-page__checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Запомнить меня</span>
          </label>

          <button type="submit" className="login-page__submit">
            Войти
          </button>

          <button
            type="button"
            className="login-page__forgot"
            onClick={() => navigate({ to: '/password-reset' })}
          >
            Забыли пароль?
          </button>
        </form>
      </section>
    </main>
  )
}
