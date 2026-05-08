import './enter-page.css'
import { useNavigate } from '@tanstack/react-router'

export function EnterPage() {
  const navigate = useNavigate()

  return (
    <main className="welcome-page">
      <section className="welcome-page__content">
        <h1 className="welcome-page__title">Добро пожаловать в Сигму</h1>
      </section>

      <section className="welcome-page__actions">
        <button
          className="btn btn--primary"
          type="button"
          onClick={() => navigate({ to: '/role', state: { authIntent: 'register' } })}
        >
          Зарегистрироваться
        </button>
        <button
          className="btn btn--secondary"
          type="button"
          onClick={() => navigate({ to: '/role', state: { authIntent: 'login' } })}
        >
          Войти
        </button>
      </section>
    </main>
  )
}
