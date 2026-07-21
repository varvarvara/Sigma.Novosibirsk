import { Link } from '@tanstack/react-router'
import './registration-closed-page.css'

export function RegistrationClosedPage() {
  return (
    <main className="registration-closed-page">
      <section className="registration-closed-card" aria-label="Регистрация закрыта">
        <div className="registration-closed-card__badge" aria-hidden="true">Σ</div>
        <h1 className="registration-closed-card__title">Регистрация закрыта</h1>
        <p className="registration-closed-card__text">
          Набор на сезон завершён. Если у вас уже есть аккаунт, войдите с выданными данными.
        </p>
        <div className="registration-closed-card__actions">
          <Link className="registration-closed-card__button" to="/login">
            Войти
          </Link>
          <Link className="registration-closed-card__link" to="/landing">
            На главную
          </Link>
        </div>
      </section>
    </main>
  )
}
