import { useNavigate } from '@tanstack/react-router'
import { AuthStarPanel } from '../../../components/auth/auth-star-panel'
import { getRoleSelectionNavigateOptions, type AuthIntent } from '../../../features/auth/auth-flow'
import '../../../components/auth/auth-split-layout.css'
import '../../../styles/auth-buttons.css'
import './welcome-page.css'

export function WelcomePage() {
  const navigate = useNavigate()

  const goToRoleSelection = (intent: AuthIntent) => {
    navigate(getRoleSelectionNavigateOptions(intent))
  }

  return (
    <main className="auth-split-layout auth-welcome">
      <section className="auth-split-layout__main auth-welcome__main" aria-label="Добро пожаловать">
        <div className="auth-welcome__mobile-star" aria-hidden="true">
          <svg className="auth-welcome__mobile-star-icon" viewBox="0 0 360 640" fill="none">
            <path
              d="M418.579 -36.8064L295.271 269.881L624.519 392.294L285.663 352.785L278.713 709.738L205.079 355.651L-366.862 593.745L159.388 272.486L-205.299 -140.767L232.585 226.733L418.579 -36.8064Z"
              fill="#7949FF"
              fillOpacity="0.5"
            />
          </svg>
        </div>

        <div className="auth-welcome__panel">
          <div className="auth-welcome__content">
            <h1 className="auth-welcome__title">
              Добро пожаловать в <span className="auth-welcome__sigma">Сигму</span>
            </h1>
            <p className="auth-welcome__subtitle">
              Платформа для летней научно-образовательной школы
            </p>
          </div>

          <div className="auth-welcome__actions auth-btn-stack">
            <button
              type="button"
              className="auth-btn auth-btn--primary"
              onClick={() => goToRoleSelection('register')}
            >
              Зарегистрироваться
            </button>
            <button
              type="button"
              className="auth-btn auth-btn--secondary"
              onClick={() => goToRoleSelection('login')}
            >
              Войти
            </button>
          </div>
        </div>
      </section>

      <AuthStarPanel />
    </main>
  )
}

export const EnterPage = WelcomePage
