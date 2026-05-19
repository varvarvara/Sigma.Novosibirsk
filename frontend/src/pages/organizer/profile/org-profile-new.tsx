import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AuthApiError, clearAuthTokens, getAccessToken, getRefreshToken, logout } from '../../../api/auth';
import {
  deleteMyAvatar,
  getCurrentStudent,
  isStaffProfile,
  updateMyStaffProfile,
  uploadMyAvatar,
  type StaffProfile,
} from '../../../api/students/profile';
import { validateBirthDate } from '../../../features/auth/birth-date-validation';
import { OrgSidebar } from '../../../shared/ui/org-sidebar';
import {
  dispatchOrgProfileUpdated,
  ORG_DEFAULT_AVATAR_SRC,
} from '../../../shared/org-profile-events';
import '../../../styles/field-error.css';
import './org-profile-new-styles.css';

const DEFAULT_AVATAR_SRC = ORG_DEFAULT_AVATAR_SRC;
const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

type ProfileData = {
  firstName: string;
  lastName: string;
  patronymic: string;
  email: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
};

const emptyProfileData: ProfileData = {
  firstName: '',
  lastName: '',
  patronymic: '',
  email: '',
  birthDay: '',
  birthMonth: '',
  birthYear: '',
};

function FieldErrorMessage({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="field-error" id={id}>
      {message}
    </p>
  );
}

function mapStaffProfile(staff: StaffProfile): ProfileData {
  const birthParts = staff.birth_date?.split('-') ?? [];

  return {
    firstName: staff.first_name,
    lastName: staff.last_name,
    patronymic: staff.partonymic ?? '',
    email: staff.email,
    birthYear: birthParts[0] ?? '',
    birthMonth: birthParts[1] ?? '',
    birthDay: birthParts[2] ?? '',
  };
}

function getFullName(profile: ProfileData) {
  return [profile.lastName, profile.firstName, profile.patronymic].filter(Boolean).join(' ');
}

function formatBirthDateForApi(day: string, month: string, year: string) {
  const dayValue = day.trim();
  const monthValue = month.trim();
  const yearValue = year.trim();

  if (!dayValue && !monthValue && !yearValue) {
    return null;
  }

  return `${yearValue}-${monthValue.padStart(2, '0')}-${dayValue.padStart(2, '0')}`;
}

export const OrgProfileNewPage = () => {
  const navigate = useNavigate();
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(DEFAULT_AVATAR_SRC);
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData);
  const [draftProfileData, setDraftProfileData] = useState<ProfileData>(emptyProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateProfileField =
    (field: keyof ProfileData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!isEditing) {
        return;
      }

      setDraftProfileData((current) => ({ ...current, [field]: event.target.value }));
      setSaveNotice(null);
      setSaveError(null);
    };

  const handleBirthChange =
    (field: 'birthDay' | 'birthMonth' | 'birthYear') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, '');
      const maxLength = field === 'birthYear' ? 4 : 2;
      const nextValue = digits.slice(0, maxLength);

      if (field === 'birthDay' && nextValue.length === 2) {
        const day = Number(nextValue);
        if (day < 1 || day > 31) {
          return;
        }
      }

      if (field === 'birthMonth' && nextValue.length === 2) {
        const month = Number(nextValue);
        if (month < 1 || month > 12) {
          return;
        }
      }

      setDraftProfileData((current) => ({ ...current, [field]: nextValue }));
      setBirthDateError(null);
      setSaveNotice(null);
      setSaveError(null);
    };

  const startEditing = () => {
    setDraftProfileData(profileData);
    setBirthDateError(null);
    setSaveError(null);
    setSaveNotice(null);
    setIsEditing(true);
  };

  const loadProfile = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      navigate({ to: '/login' });
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);

    try {
      const user = await getCurrentStudent();
      if (!isStaffProfile(user)) {
        setProfileError('Эта страница доступна только организаторам');
        return;
      }

      const mapped = mapStaffProfile(user);
      setProfileData(mapped);
      setDraftProfileData(mapped);
      const nextAvatar = user.avatar_url ?? DEFAULT_AVATAR_SRC;
      setAvatarSrc(nextAvatar);
      dispatchOrgProfileUpdated({
        avatarUrl: nextAvatar,
        firstName: mapped.firstName,
        lastName: mapped.lastName,
        patronymic: mapped.patronymic,
        email: mapped.email,
      });
      setIsEditing(false);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        clearAuthTokens();
        navigate({ to: '/login' });
        return;
      }

      setProfileError('Не удалось загрузить профиль');
    } finally {
      setIsProfileLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const birthInputClass = birthDateError ? 'field-input--error' : '';
  const fullName = getFullName(profileData);
  const formValues = isEditing ? draftProfileData : profileData;
  const isFormDisabled = isProfileLoading || isProfileSaving || !isEditing;

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      return;
    }

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      alert('Нужно выбрать файл изображения.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > AVATAR_MAX_SIZE_BYTES) {
      alert('Максимальный размер аватара: 5 МБ.');
      event.target.value = '';
      return;
    }

    setIsAvatarUploading(true);

    try {
      const uploaded = await uploadMyAvatar(selectedFile);
      const nextAvatar = uploaded.avatar_url || DEFAULT_AVATAR_SRC;
      setAvatarSrc(nextAvatar);
      dispatchOrgProfileUpdated({ avatarUrl: nextAvatar });
      setSaveNotice('Аватар обновлён');
      setSaveError(null);
    } catch (error) {
      if (error instanceof AuthApiError) {
        alert(error.message);
      } else {
        alert('Не удалось загрузить аватар.');
      }
    } finally {
      setIsAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    if (!isEditing) {
      return;
    }

    setIsAvatarUploading(true);

    try {
      const user = await deleteMyAvatar();
      const nextAvatar = isStaffProfile(user) ? user.avatar_url ?? DEFAULT_AVATAR_SRC : DEFAULT_AVATAR_SRC;
      setAvatarSrc(nextAvatar);
      dispatchOrgProfileUpdated({ avatarUrl: nextAvatar });
      setSaveNotice('Аватар удалён');
      setSaveError(null);
    } catch (error) {
      if (error instanceof AuthApiError) {
        alert(error.message);
      } else {
        alert('Не удалось удалить аватар.');
      }
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const saveProfile = async () => {
    const firstName = draftProfileData.firstName.trim();
    const lastName = draftProfileData.lastName.trim();

    if (!firstName || !lastName) {
      setSaveError('Укажите имя и фамилию');
      return;
    }

    const { birthDay, birthMonth, birthYear } = draftProfileData;
    const hasBirthInput = Boolean(birthDay || birthMonth || birthYear);

    if (hasBirthInput) {
      const birthError = validateBirthDate(birthDay, birthMonth, birthYear);
      if (birthError) {
        setBirthDateError(birthError);
        return;
      }
    }

    setBirthDateError(null);
    setIsProfileSaving(true);
    setSaveError(null);
    setSaveNotice(null);

    try {
      const updated = await updateMyStaffProfile({
        first_name: firstName,
        last_name: lastName,
        partonymic: draftProfileData.patronymic.trim() || null,
        birth_date: hasBirthInput ? formatBirthDateForApi(birthDay, birthMonth, birthYear) : null,
      });

      const mapped = mapStaffProfile(updated);
      setProfileData(mapped);
      setDraftProfileData(mapped);
      const nextAvatar = updated.avatar_url ?? avatarSrc ?? DEFAULT_AVATAR_SRC;
      setAvatarSrc(nextAvatar);
      dispatchOrgProfileUpdated({
        avatarUrl: nextAvatar,
        firstName: mapped.firstName,
        lastName: mapped.lastName,
        patronymic: mapped.patronymic,
        email: mapped.email,
      });
      setSaveNotice('Изменения сохранены');
      setIsEditing(false);
    } catch (error) {
      if (error instanceof AuthApiError) {
        setSaveError(error.message);
      } else {
        setSaveError('Не удалось сохранить профиль');
      }
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    try {
      if (accessToken || refreshToken) {
        await logout({ refresh_token: refreshToken }, accessToken);
      }
    } catch {
      // Logout continues locally even if the API request fails.
    } finally {
      clearAuthTokens();
      setIsLoggingOut(false);
      navigate({ to: '/login' });
    }
  };

  return (
    <div className="org-layout org-profile-container">
      <OrgSidebar avatarSrc={avatarSrc ?? undefined} />

      <main className="org-layout__workspace org-profile-content">
        <header className="org-profile-hero">
          <div className="org-profile-hero__banner" aria-hidden="true" />
          <div className="org-profile-hero__panel">
            <div className="org-profile-hero__main">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Аватар профиля" className="org-profile-hero__avatar" />
              ) : (
                <div className="org-profile-hero__avatar org-profile-hero__avatar--empty" aria-hidden="true" />
              )}
              <div className="org-profile-hero__info">
                <h1>{fullName || 'Профиль организатора'}</h1>
                <p>{profileData.email || 'Почта'}</p>
              </div>
            </div>
            <button className="org-profile-hero__logout" type="button" onClick={() => void handleLogout()} disabled={isLoggingOut}>
              Выйти из аккаунта
            </button>
          </div>
        </header>

        {isProfileLoading || profileError || saveError || saveNotice ? (
          <div className="org-profile-status-stack" role="status">
            {isProfileLoading ? <p className="org-profile-status">Загрузка...</p> : null}
            {profileError ? <p className="org-profile-status org-profile-status--error">{profileError}</p> : null}
            {saveError ? <p className="org-profile-status org-profile-status--error">{saveError}</p> : null}
            {saveNotice ? <p className="org-profile-status org-profile-status--success">{saveNotice}</p> : null}
          </div>
        ) : null}

        <div className="profile-card">
          <section className="profile-section">
            <h2>Личная информация</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="org-profile-first-name">Имя</label>
                <input
                  id="org-profile-first-name"
                  type="text"
                  value={formValues.firstName}
                  placeholder="Имя"
                  readOnly={!isEditing}
                  disabled={isFormDisabled}
                  onChange={updateProfileField('firstName')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="org-profile-last-name">Фамилия</label>
                <input
                  id="org-profile-last-name"
                  type="text"
                  value={formValues.lastName}
                  placeholder="Фамилия"
                  readOnly={!isEditing}
                  disabled={isFormDisabled}
                  onChange={updateProfileField('lastName')}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="org-profile-patronymic">Отчество</label>
                <input
                  id="org-profile-patronymic"
                  type="text"
                  value={formValues.patronymic}
                  placeholder="Отчество"
                  readOnly={!isEditing}
                  disabled={isFormDisabled}
                  onChange={updateProfileField('patronymic')}
                />
              </div>
            </div>
            <div className="form-row birth-row">
              <div className="form-group small">
                <label htmlFor="org-profile-birth-day">Дата рождения</label>
                <input
                  id="org-profile-birth-day"
                  type="text"
                  inputMode="numeric"
                  value={formValues.birthDay}
                  readOnly={!isEditing}
                  placeholder="ДД"
                  maxLength={2}
                  className={birthInputClass}
                  disabled={isFormDisabled}
                  onChange={handleBirthChange('birthDay')}
                />
              </div>
              <div className="form-group small">
                <label className="sr-only" htmlFor="org-profile-birth-month">
                  Месяц
                </label>
                <input
                  id="org-profile-birth-month"
                  type="text"
                  inputMode="numeric"
                  value={formValues.birthMonth}
                  readOnly={!isEditing}
                  placeholder="ММ"
                  maxLength={2}
                  className={birthInputClass}
                  disabled={isFormDisabled}
                  onChange={handleBirthChange('birthMonth')}
                />
              </div>
              <div className="form-group small">
                <label className="sr-only" htmlFor="org-profile-birth-year">
                  Год
                </label>
                <input
                  id="org-profile-birth-year"
                  type="text"
                  inputMode="numeric"
                  value={formValues.birthYear}
                  readOnly={!isEditing}
                  placeholder="ГГГГ"
                  maxLength={4}
                  className={birthInputClass}
                  disabled={isFormDisabled}
                  onChange={handleBirthChange('birthYear')}
                />
              </div>
            </div>
            <FieldErrorMessage id="org-profile-birth-date-error" message={birthDateError ?? undefined} />
          </section>

          <section className="profile-section">
            <h2>Контакты</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="org-profile-email">Email</label>
                <input id="org-profile-email" type="email" value={profileData.email} placeholder="Почта" readOnly />
                <p className="org-profile-hint">Email меняется только через администратора</p>
              </div>
            </div>
          </section>

          {isEditing ? (
            <section className="profile-section upload-section">
              <div className="upload-row">
                {avatarSrc ? (
                  <img className="upload-avatar" src={avatarSrc} alt="Аватар" />
                ) : (
                  <div className="upload-avatar upload-avatar--empty" aria-hidden="true" />
                )}
                <label
                  className="upload-dropzone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const file = event.dataTransfer.files[0];
                    if (!file) {
                      return;
                    }
                    const input = document.createElement('input');
                    input.type = 'file';
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    void handleAvatarChange({ target: input } as ChangeEvent<HTMLInputElement>);
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
                  <p>{isAvatarUploading ? 'Загрузка...' : 'Нажмите или перетащите'}</p>
                  <span>SVG, PNG, JPG or GIF (max. 5 MB)</span>
                </label>
              </div>
            </section>
          ) : null}
          <div className="profile-actions">
            {!isEditing ? (
              <button
                className="profile-edit-button org-profile-clickable"
                type="button"
                onClick={startEditing}
                disabled={isProfileLoading || Boolean(profileError)}
              >
                Изменить данные в профиле
              </button>
            ) : (
              <>
                <button
                  className="profile-delete-button org-profile-clickable"
                  type="button"
                  onClick={() => void handleDeleteAvatar()}
                  disabled={isAvatarUploading || isFormDisabled}
                >
                  Удалить
                </button>
                <button
                  className="profile-save-button org-profile-clickable"
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
    </div>
  );
};
