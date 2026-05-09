import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from '@untitledui/icons/ChevronLeft'
import './password-reset-success-page.css'

export function PasswordResetSuccessPage() {
  const navigate = useNavigate()

  return (
    <main className="password-reset-success-page">
      <button
        type="button"
        className="password-reset-success-page__back app-back-button"
        aria-label="Назад"
        onClick={() => navigate({ to: '/password-reset' })}
      >
        <ChevronLeft className="app-back-button__icon" size={24} color="#2A2730" />
      </button>

      <section className="password-reset-success-page__content">
        <h1 className="password-reset-success-page__title">Пароль изменён</h1>
        <p className="password-reset-success-page__subtitle">Теперь войдите с новым паролем</p>

        <button
          type="button"
          className="password-reset-success-page__submit"
          onClick={() => navigate({ to: '/login' })}
        >
          Войти
        </button>
      </section>
    </main>
  )
}
