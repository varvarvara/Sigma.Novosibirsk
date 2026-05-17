import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import './org-profile-new-styles.css';

const initialProfileData = {
  firstName: 'Анна',
  lastName: 'Смирнова',
  patronymic: 'Игоревна',
  email: 'organizer@sigma.ru',
  birthDay: '15',
  birthMonth: '03',
  birthYear: '1998',
  phoneCountry: 'RUS',
  phoneNumber: '+7 (555) 000-00-00',
};

type ProfileData = typeof initialProfileData;

const getInitialProfileData = (): ProfileData => {
  const savedProfile = localStorage.getItem('orgProfileData');

  if (!savedProfile) {
    return initialProfileData;
  }

  return { ...initialProfileData, ...JSON.parse(savedProfile) };
};

export const OrgProfileNewPage = () => {
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => localStorage.getItem('orgProfileAvatar') ?? '/teacher/profile/avatar-profile.png');
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState<string | null | undefined>(undefined);
  const [profileData, setProfileData] = useState<ProfileData>(getInitialProfileData);
  const [draftProfileData, setDraftProfileData] = useState<ProfileData>(getInitialProfileData);

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setDraftProfileData((data) => ({ ...data, [field]: value }));
  };

  const uploadAvatar = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextAvatar = String(reader.result);

      setPendingAvatarSrc(nextAvatar);
    };
    reader.readAsDataURL(file);
  };

  const fullName = [profileData.lastName, profileData.firstName, profileData.patronymic].filter(Boolean).join(' ');
  const previewAvatarSrc = pendingAvatarSrc === undefined ? avatarSrc : pendingAvatarSrc;

  const saveProfile = () => {
    setProfileData(draftProfileData);
    localStorage.setItem('orgProfileData', JSON.stringify(draftProfileData));

    if (pendingAvatarSrc !== undefined) {
      setAvatarSrc(pendingAvatarSrc);

      if (pendingAvatarSrc) {
        localStorage.setItem('orgProfileAvatar', pendingAvatarSrc);
      } else {
        localStorage.removeItem('orgProfileAvatar');
      }

      setPendingAvatarSrc(undefined);
    }
  };

  const handleLogout = () => {
    navigate({ to: '/login' });
  };

  return (
    <div className="org-profile-container">
      <aside className="org-profile-sidebar" aria-label="Навигация">
        <img className="org-profile-sidebar__reference" src="/sidebar-navigation.svg" alt="" aria-hidden="true" />
        {avatarSrc && <img className="org-profile-sidebar__avatar" src={avatarSrc} alt="" aria-hidden="true" />}
        <button className="org-profile-sidebar__hotspot org-profile-sidebar__hotspot--logo org-profile-clickable" type="button" aria-label="Главная" onClick={() => navigate({ to: '/org-extracurricular' })} />
        <button className="org-profile-sidebar__hotspot org-profile-sidebar__hotspot--users org-profile-clickable" type="button" aria-label="Участники" />
        <button className="org-profile-sidebar__hotspot org-profile-sidebar__hotspot--calendar org-profile-clickable" type="button" aria-label="Мероприятия" onClick={() => navigate({ to: '/org-extracurricular' })} />
        <button className="org-profile-sidebar__hotspot org-profile-sidebar__hotspot--courses org-profile-clickable" type="button" aria-label="Курсы" />
        <button className="org-profile-sidebar__hotspot org-profile-sidebar__hotspot--teams org-profile-clickable" type="button" aria-label="Команды" onClick={() => navigate({ to: '/team-formation' })} />
        <button className="org-profile-sidebar__hotspot org-profile-sidebar__hotspot--settings org-profile-clickable" type="button" aria-label="Настройки" />
        <button className="org-profile-sidebar__hotspot org-profile-sidebar__hotspot--profile org-profile-clickable" type="button" aria-label="Профиль" onClick={() => navigate({ to: '/org-profile' })} />
      </aside>
      
      <main className="org-profile-content">
        <div className="profile-header-gradient" />
        <div className="profile-header-card">
          <div className="profile-header-content">
            {previewAvatarSrc ? (
              <img
                src={previewAvatarSrc}
                alt="Аватар профиля"
                className="profile-avatar-large"
              />
            ) : (
              <div className="profile-avatar-large profile-avatar-large--empty" aria-hidden="true" />
            )}
            <div className="profile-user-info">
              <h1>{fullName || 'Фамилия Имя Отчество'}</h1>
              <p>{profileData.email || 'Почта'}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>

        <div className="profile-card">
          <section className="profile-section">
            <h2>Личная информация</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Имя</label>
                <input type="text" value={draftProfileData.firstName} placeholder="Имя" onChange={(event) => updateProfileField('firstName', event.target.value)} />
              </div>
              <div className="form-group">
                <label>Фамилия</label>
                <input type="text" value={draftProfileData.lastName} placeholder="Фамилия" onChange={(event) => updateProfileField('lastName', event.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Отчество</label>
                <input type="text" value={draftProfileData.patronymic} placeholder="Отчество" onChange={(event) => updateProfileField('patronymic', event.target.value)} />
              </div>
            </div>
            <div className="form-row birth-row">
              <div className="form-group small">
                <label>Дата рождения</label>
                <input type="text" value={draftProfileData.birthDay} placeholder="День" onChange={(event) => updateProfileField('birthDay', event.target.value)} />
              </div>
              <div className="form-group small">
                <label className="sr-only">Месяц</label>
                <input type="text" value={draftProfileData.birthMonth} placeholder="Месяц" onChange={(event) => updateProfileField('birthMonth', event.target.value)} />
              </div>
              <div className="form-group small">
                <label className="sr-only">Год</label>
                <input type="text" value={draftProfileData.birthYear} placeholder="Год" onChange={(event) => updateProfileField('birthYear', event.target.value)} />
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Контакты</h2>
            <div className="form-row">
              <div className="form-group phone">
                <label>Номер телефона</label>
                <div className="phone-input">
                  <input type="text" value={draftProfileData.phoneCountry} placeholder="Страна" onChange={(event) => updateProfileField('phoneCountry', event.target.value)} />
                  <input type="text" value={draftProfileData.phoneNumber} placeholder="Номер" onChange={(event) => updateProfileField('phoneNumber', event.target.value)} />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={draftProfileData.email} placeholder="Почта" onChange={(event) => updateProfileField('email', event.target.value)} />
              </div>
            </div>
          </section>

          <section className="profile-section upload-section">
            <div className="upload-row">
              {previewAvatarSrc ? (
                <img
                  className="upload-avatar"
                  src={previewAvatarSrc}
                  alt="Аватар"
                />
              ) : (
                <div className="upload-avatar upload-avatar--empty" aria-hidden="true" />
              )}
              <label
                className="upload-dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  uploadAvatar(event.dataTransfer.files[0]);
                }}
              >
                <input
                  className="upload-input"
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/gif"
                  onChange={(event) => uploadAvatar(event.target.files?.[0])}
                />
                <img
                  className="upload-icon"
                  src="/teacher/profile/upload-cloud.svg"
                  alt="Загрузка"
                />
                <p>Нажмите или перетащите</p>
                <span>SVG, PNG, JPG or GIF (max. 800x400px)</span>
              </label>
            </div>
          </section>
          <div className="profile-actions">
          <button className="profile-delete-button org-profile-clickable" type="button" onClick={() => {
            setPendingAvatarSrc(null);
          }}>
                    Удалить
                  </button>
                  <button className="profile-save-button org-profile-clickable" type="button" onClick={saveProfile}>
                    Сохранить
                  </button>
          </div>
        </div>
      </main>
    </div>
  );
};
