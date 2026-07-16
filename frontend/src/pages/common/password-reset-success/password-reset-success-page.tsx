import { useNavigate } from '@tanstack/react-router'
import { AuthBackButton } from '../../../features/auth/ui/auth-back-button'
import { AuthStarPanel } from '../../../features/auth/ui/auth-star-panel'
import { isMobileAuthViewport } from '../../../features/auth/auth-flow'
import '../../../features/auth/ui/auth-split-layout.css'
import './password-reset-success-page.css'

type PasswordResetSuccessContentProps = {
  variant: 'mobile' | 'desktop'
  onLogin: () => void
}

function PasswordResetSuccessContent({ variant, onLogin }: PasswordResetSuccessContentProps) {
  const isMobile = variant === 'mobile'

  return (
    <div className={`password-reset-success-page__panel password-reset-success-page__panel--${variant}`}>
      {isMobile ? (
        <AuthBackButton
          fallback={{ to: '/login' }}
          className="password-reset-success-page__back app-back-button"
        />
      ) : null}

      <section className="password-reset-success-page__content">
        <h1 className="password-reset-success-page__title">Пароль изменён</h1>
        <p className="password-reset-success-page__subtitle">Теперь войдите с новым паролем</p>

        <button type="button" className="password-reset-success-page__submit" onClick={onLogin}>
          Войти
        </button>
      </section>
    </div>
  )
}

export function PasswordResetSuccessPage() {
  const navigate = useNavigate()
  const isMobile = isMobileAuthViewport()
  const handleLogin = () => navigate({ to: '/login' })

  if (isMobile) {
    return (
      <main className="password-reset-success-page password-reset-success-page--mobile">
        <PasswordResetSuccessContent variant="mobile" onLogin={handleLogin} />
      </main>
    )
  }

  return (
    <div className="auth-split-layout auth-login-layout">
      <main className="auth-split-layout__main password-reset-success-page password-reset-success-page--desktop">
        <PasswordResetSuccessContent variant="desktop" onLogin={handleLogin} />
      </main>
      <AuthStarPanel />
    </div>
  )
}
