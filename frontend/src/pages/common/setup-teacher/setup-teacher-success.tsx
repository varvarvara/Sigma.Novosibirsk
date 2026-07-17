import './setup-teacher-styles.css'

export function SetupTeacherSuccessPage() {
  const handleReload = () => {
    window.location.assign('/role')
  }

  return (
    <main className="setup-teacher-success-page">
      <div className="setup-teacher-success-page__content">
        <div className="setup-teacher-success-page__icon" aria-hidden>
          <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M11 1L1 13H10L9 21L19 9H10L11 1Z"
              stroke="#7F56D9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="setup-teacher-success-page__title">Регистрация прошла успешно</h1>

        <p className="setup-teacher-success-page__subtitle">
          В течение нескольких дней с вами свяжется организатор
        </p>

        <button type="button" className="setup-teacher-success-page__button" onClick={handleReload}>
          Перезагрузить страницу
        </button>
      </div>
    </main>
  )
}
