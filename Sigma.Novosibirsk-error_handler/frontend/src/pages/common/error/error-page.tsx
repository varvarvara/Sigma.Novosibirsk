import './error-page.css'

type ErrorPageProps = {
  error?: unknown
  reset?: () => void
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="error-page">
      <section className="error-page__card" aria-label="Ошибка приложения">
        <div className="error-page__content" role="alert" aria-live="polite">
          <div className="error-page__icon" aria-hidden="true">
            <span className="error-page__icon-circle error-page__icon-circle--outer" />
            <span className="error-page__icon-circle error-page__icon-circle--inner" />
            <img className="error-page__icon-image" src="/error/flash.svg" alt="" />
          </div>

          <div className="error-page__text">
            <h1 className="error-page__title">Не удалось загрузить данные</h1>
            <p className="error-page__description">
              Сервер временно недоступен. Мы уже работаем над этим.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}