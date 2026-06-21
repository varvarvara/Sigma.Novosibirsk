import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
import '../../../styles/field-error.css';
import { getTeacherFullName, TEACHER_DEFAULT_AVATAR_SRC, TEACHER_STUDY_YEAR_OPTIONS } from '../../../features/teacher/teacher-profile';
import { useTeacherProfile } from '../../../features/teacher/use-teacher-profile';
import './teacher-profile-new-styles.css';

export const TeacherProfileNewPage = () => {
  const {
    birthDateError,
    avatarSrc,
    profileData,
    draftProfileData,
    isEditing,
    startEditing,
    isProfileLoading,
    isProfileSaving,
    isAvatarUploading,
    isLoggingOut,
    profileError,
    saveNotice,
    saveError,
    handleFieldChange,
    handleBirthChange,
    uploadAvatarFile,
    handleAvatarChange,
    handleDeleteAvatar,
    saveProfile,
    handleLogout,
  } = useTeacherProfile();

  const fullName = getTeacherFullName(profileData);
  const formValues = isEditing ? draftProfileData : profileData;
  const isFormDisabled = isProfileLoading || isProfileSaving || !isEditing;

  return (
    <TeacherAppShell avatarSrc={avatarSrc ?? undefined} className="teacher-profile-container">
      <main className="teacher-profile-content">
        <header className="teacher-profile-hero">
          <div className="teacher-profile-hero__banner" aria-hidden="true" />
          <div className="teacher-profile-hero__panel">
            <div className="teacher-profile-hero__main">
              <img
                src={avatarSrc ?? TEACHER_DEFAULT_AVATAR_SRC}
                alt="Аватар профиля"
                className="teacher-profile-hero__avatar"
              />
              <div className="teacher-profile-hero__info">
                <h1>{fullName || 'ФИО'}</h1>
                <p>{profileData.email || 'Почта'}</p>
              </div>
            </div>
            <button
              className="teacher-profile-hero__logout"
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
            >
              Выйти из аккаунта
            </button>
          </div>
        </header>

        {isProfileLoading ? <p className="teacher-profile-status">Загрузка...</p> : null}
        {profileError ? <p className="teacher-profile-status teacher-profile-status--error">{profileError}</p> : null}
        {saveError ? <p className="teacher-profile-status teacher-profile-status--error">{saveError}</p> : null}
        {saveNotice ? <p className="teacher-profile-status teacher-profile-status--success">{saveNotice}</p> : null}

        <div className="profile-card">
          <section className="profile-section">
            <h2>Личная информация</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher-profile-first-name">Имя</label>
                <input
                  id="teacher-profile-first-name"
                  type="text"
                  value={formValues.firstName}
                  readOnly={!isEditing}
                  placeholder="Имя"
                  disabled={isFormDisabled}
                  onChange={(event) => handleFieldChange('firstName', event.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="teacher-profile-last-name">Фамилия</label>
                <input
                  id="teacher-profile-last-name"
                  type="text"
                  value={formValues.lastName}
                  readOnly={!isEditing}
                  placeholder="Фамилия"
                  disabled={isFormDisabled}
                  onChange={(event) => handleFieldChange('lastName', event.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher-profile-patronymic">Отчество</label>
                <input
                  id="teacher-profile-patronymic"
                  type="text"
                  value={formValues.patronymic}
                  readOnly={!isEditing}
                  placeholder="Отчество"
                  disabled={isFormDisabled}
                  onChange={(event) => handleFieldChange('patronymic', event.target.value)}
                />
              </div>
            </div>
            <div className="form-row birth-row">
              <div className="form-group small">
                <label htmlFor="teacher-profile-birth-day">Дата рождения</label>
                <input
                  id="teacher-profile-birth-day"
                  type="text"
                  value={formValues.birthDay}
                  readOnly={!isEditing}
                  placeholder="День"
                  disabled={isFormDisabled}
                  onChange={(event) => handleBirthChange('birthDay', event.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="form-group small">
                <label className="sr-only" htmlFor="teacher-profile-birth-month">
                  Месяц
                </label>
                <input
                  id="teacher-profile-birth-month"
                  type="text"
                  value={formValues.birthMonth}
                  readOnly={!isEditing}
                  placeholder="Месяц"
                  disabled={isFormDisabled}
                  onChange={(event) => handleBirthChange('birthMonth', event.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="form-group small">
                <label className="sr-only" htmlFor="teacher-profile-birth-year">
                  Год
                </label>
                <input
                  id="teacher-profile-birth-year"
                  type="text"
                  value={formValues.birthYear}
                  readOnly={!isEditing}
                  placeholder="Год"
                  disabled={isFormDisabled}
                  onChange={(event) => handleBirthChange('birthYear', event.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>
            {birthDateError ? <p className="field-error">{birthDateError}</p> : null}
          </section>

          <section className="profile-section">
            <h2>Место обучения</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher-profile-university">Университет</label>
                <input
                  id="teacher-profile-university"
                  type="text"
                  value={formValues.university}
                  readOnly={!isEditing}
                  placeholder="Университет"
                  disabled={isFormDisabled}
                  onChange={(event) => handleFieldChange('university', event.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="teacher-profile-direction">Направление</label>
                <input
                  id="teacher-profile-direction"
                  type="text"
                  value={formValues.direction}
                  readOnly={!isEditing}
                  placeholder="Направление"
                  disabled={isFormDisabled}
                  onChange={(event) => handleFieldChange('direction', event.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher-profile-course">Курс обучения</label>
                <select
                  id="teacher-profile-course"
                  value={formValues.course}
                  disabled={isFormDisabled}
                  onChange={(event) => handleFieldChange('course', event.target.value)}
                >
                  <option value="">Выберите</option>
                  {TEACHER_STUDY_YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year} курс
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Контакты</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher-profile-email">Email</label>
                <input id="teacher-profile-email" type="text" value={formValues.email} placeholder="Почта" readOnly />
              </div>
            </div>
          </section>

          {isEditing ? (
            <section className="profile-section upload-section">
              <div className="upload-row">
                <img className="upload-avatar" src={avatarSrc ?? TEACHER_DEFAULT_AVATAR_SRC} alt="Аватар" />
                <label
                  className="upload-dropzone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const file = event.dataTransfer.files[0];
                    if (!file) {
                      return;
                    }
                    void uploadAvatarFile(file);
                  }}
                >
                  <input
                    className="upload-input"
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg,image/gif"
                    disabled={isAvatarUploading || isFormDisabled}
                    onChange={(event) => void handleAvatarChange(event)}
                  />
                  <img className="upload-icon" src="/teacher/profile/upload-cloud.svg" alt="Загрузка" />
                  <p>Нажмите или перетащите</p>
                  <span>SVG, PNG, JPG or GIF (max. 5 MB)</span>
                </label>
              </div>
            </section>
          ) : null}
          <div className="profile-actions">
            {!isEditing ? (
              <button
                className="profile-edit-button"
                type="button"
                onClick={startEditing}
                disabled={isProfileLoading || Boolean(profileError)}
              >
                Изменить данные в профиле
              </button>
            ) : (
              <>
                <button
                  className="profile-delete-button"
                  type="button"
                  onClick={() => void handleDeleteAvatar()}
                  disabled={isAvatarUploading || isFormDisabled}
                >
                  Удалить
                </button>
                <button
                  className="profile-save-button"
                  type="button"
                  onClick={() => void saveProfile()}
                  disabled={isFormDisabled || isAvatarUploading}
                >
                  {isProfileSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </TeacherAppShell>
  );
};
