import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from '@untitledui/icons/ChevronLeft'
import { Eye } from '@untitledui/icons/Eye'
import { EyeOff } from '@untitledui/icons/EyeOff'
import './password-reset-page.css'

export function PasswordResetPage() {
  const navigate = useNavigate()
  const [showPasswords, setShowPasswords] = useState(false)
  
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate({ to: '/password-reset/success' })
  }

  return (
    <main className="password-reset-page">
      <button
        type="button"
        className="password-reset-page__back app-back-button"
        aria-label="Назад"
        onClick={() => navigate({ to: '/login' })}
      >
        <ChevronLeft className="app-back-button__icon" size={24} color="#2A2730" />
      </button>

      <section className="password-reset-page__content">
        <h1 className="password-reset-page__title">Восстановление пароля</h1>
        <p className="password-reset-page__subtitle">Придумайте новый надежный пароль</p>

        <form className="password-reset-page__form" onSubmit={handleSubmit}>
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
              />
              <button
                type="button"
                className="password-reset-page__password-toggle"
                aria-label={showPasswords ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPasswords((prev) => !prev)}
              >
                {showPasswords ? <EyeOff size={18} color="#625F68" /> : <Eye size={18} color="#625F68" />}
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
              />
              <button
                type="button"
                className="password-reset-page__password-toggle"
                aria-label={showPasswords ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPasswords((prev) => !prev)}
              >
                {showPasswords ? <EyeOff size={18} color="#625F68" /> : <Eye size={18} color="#625F68" />}
              </button>
            </div>
          </div>

          <button type="submit" className="password-reset-page__submit">
            Сохранить
          </button>

          <p className="password-reset-page__help">
            Если у вас возникли проблемы:{' '}
            <a
              className="password-reset-page__help-link"
              href="https://t.me/varya_murash/"
              aria-label="Перейти в Telegram @varya_murash"
            >
              напишите нам
            </a>
          </p>
        </form>
      </section>
    </main>
  )
}
