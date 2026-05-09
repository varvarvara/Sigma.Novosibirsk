import './enter-page.css'
import { useNavigate } from '@tanstack/react-router'

export function EnterPage() {
  const navigate = useNavigate()

  return (
    <main className="welcome-page">
      <div className='star'>
        <svg className='star-icon' viewBox="0 0 360 640" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M418.579 -36.8064L295.271 269.881L624.519 392.294L285.663 352.785L278.713 709.738L205.079 355.651L-366.862 593.745L159.388 272.486L-205.299 -140.767L232.585 226.733L418.579 -36.8064Z" fill="#7949FF" fill-opacity="0.5"/>
        </svg>
      </div>
      <section className="welcome-page__content">
        <h1 className="welcome-page__title">Добро пожаловать в <span className="sigma">Сигму</span></h1>
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
