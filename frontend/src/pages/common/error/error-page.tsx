import './error-page.css'

type ErrorPageProps = {
  error?: unknown
  reset?: () => void
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  return null
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  const errorDetails = import.meta.env.DEV ? getErrorDetails(error) : null

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
            <h1 className="error-page__title">Произошла ошибка приложения</h1>
            <p className="error-page__description">
              Не удалось отобразить экран. Попробуйте повторить действие ещё раз.
            </p>
            {errorDetails ? <p className="error-page__details">{errorDetails}</p> : null}
          </div>

          {reset ? (
            <button className="error-page__button" type="button" onClick={reset}>
              Попробовать снова
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}
