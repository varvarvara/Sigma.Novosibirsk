import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { TeacherSidebar } from '../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-profile-new-styles.css';

const initialProfileData = {
  firstName: 'Оливия',
  lastName: 'Ричардсон',
  patronymic: '',
  email: 'olivia@untitledui.com',
  birthDay: '15',
  birthMonth: '03',
  birthYear: '1998',
  phoneCountry: 'RUS',
  phoneNumber: '',
  university: 'МГУ им. М.В. Ломоносова',
  direction: 'Информатика и вычислительная техника',
  course: '',
  socialNick: '',
};

type ProfileData = typeof initialProfileData;

const defaultAvatarSrc = '/teacher/profile/avatar-profile.png';

const getInitialProfileData = (): ProfileData => {
  const savedProfile = localStorage.getItem('teacherProfileData');

  if (!savedProfile) {
    return initialProfileData;
  }

  return { ...initialProfileData, ...JSON.parse(savedProfile), phoneCountry: 'RUS' };
};

export const TeacherProfileNewPage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>(getInitialProfileData);
  const [draftProfileData, setDraftProfileData] = useState<ProfileData>(getInitialProfileData);
  const [avatarSrc, setAvatarSrc] = useState(() => localStorage.getItem('teacherProfileAvatar') ?? defaultAvatarSrc);
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState<string | null>(null);

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setDraftProfileData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleBirthChange = (field: 'birthDay' | 'birthMonth' | 'birthYear', value: string) => {
    const digits = value.replace(/\D/g, '');
    const maxLength = field === 'birthYear' ? 4 : 2;
    const nextValue = digits.slice(0, maxLength);

    if (field === 'birthDay' && nextValue.length === 2) {
      const day = Number(nextValue);
      if (day < 1 || day > 31) return;
    }

    if (field === 'birthMonth' && nextValue.length === 2) {
      const month = Number(nextValue);
      if (month < 1 || month > 12) return;
    }

    handleFieldChange(field, nextValue);
  };

  const uploadAvatar = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPendingAvatarSrc(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const nextProfileData = { ...draftProfileData, phoneCountry: 'RUS' };

    setProfileData(nextProfileData);
    setDraftProfileData(nextProfileData);
    localStorage.setItem('teacherProfileData', JSON.stringify(nextProfileData));

    if (pendingAvatarSrc) {
      setAvatarSrc(pendingAvatarSrc);
      localStorage.setItem('teacherProfileAvatar', pendingAvatarSrc);
      window.dispatchEvent(new Event('teacherProfileAvatarChanged'));
      setPendingAvatarSrc(null);
    }
  };

  const handleDeleteAvatar = () => {
    setPendingAvatarSrc(null);
    setAvatarSrc(defaultAvatarSrc);
    localStorage.removeItem('teacherProfileAvatar');
    window.dispatchEvent(new Event('teacherProfileAvatarChanged'));
  };

  const handleLogout = () => {
    navigate({ to: '/login' });
  };

  const uploadPreviewAvatarSrc = pendingAvatarSrc || avatarSrc;
  const fullName = [profileData.firstName, profileData.lastName, profileData.patronymic].filter(Boolean).join(' ');

  return (
    <div className="teacher-profile-container">
      <TeacherSidebar />
      
      <main className="teacher-profile-content">
        {/* Градиент заголовок */}
        <div className="profile-header-gradient">
          <div className="profile-header-card">
            <div className="profile-header-content">
              <img
                src={avatarSrc}
                alt="Аватар профиля"
                className="profile-avatar-large"
              />
              <div className="profile-user-info">
                <h1>{fullName || 'ФИО'}</h1>
                <p>{profileData.email}</p>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Выйти из аккаунта
            </button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="profile-card">
          <section className="profile-section">
            <h2>Личная информация</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Имя</label>
                <input type="text" value={draftProfileData.firstName} placeholder="Имя" onChange={(event) => handleFieldChange('firstName', event.target.value)} />
              </div>
              <div className="form-group">
                <label>Фамилия</label>
                <input type="text" value={draftProfileData.lastName} placeholder="Фамилия" onChange={(event) => handleFieldChange('lastName', event.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Отчество</label>
                <input type="text" value={draftProfileData.patronymic} placeholder="Отчество" onChange={(event) => handleFieldChange('patronymic', event.target.value)} />
              </div>
            </div>
            <div className="form-row birth-row">
              <div className="form-group small">
                <label>Дата рождения</label>
                <input type="text" value={draftProfileData.birthDay} placeholder="День" onChange={(event) => handleBirthChange('birthDay', event.target.value)} inputMode="numeric" />
              </div>
              <div className="form-group small">
                <label className="sr-only">Месяц</label>
                <input type="text" value={draftProfileData.birthMonth} placeholder="Месяц" onChange={(event) => handleBirthChange('birthMonth', event.target.value)} inputMode="numeric" />
              </div>
              <div className="form-group small">
                <label className="sr-only">Год</label>
                <input type="text" value={draftProfileData.birthYear} placeholder="Год" onChange={(event) => handleBirthChange('birthYear', event.target.value)} inputMode="numeric" />
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Место обучения</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Университет</label>
                <input type="text" value={draftProfileData.university} placeholder="Университет" onChange={(event) => handleFieldChange('university', event.target.value)} />
              </div>
              <div className="form-group">
                <label>Направление</label>
                <input type="text" value={draftProfileData.direction} placeholder="Направление" onChange={(event) => handleFieldChange('direction', event.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group select">
                <label>Курс обучения</label>
                <input type="text" value={draftProfileData.course} placeholder="Курс обучения" onChange={(event) => handleFieldChange('course', event.target.value)} />
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Контакты</h2>
            <div className="form-row">
              <div className="form-group phone">
                <label>Номер телефона</label>
                <div className="phone-input">
                  <input type="text" value="RUS" readOnly />
                  <input type="text" value={draftProfileData.phoneNumber} placeholder="+7 (ХХХ) ХХХ-ХХ-ХХ" onChange={(event) => handleFieldChange('phoneNumber', event.target.value)} />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={draftProfileData.email} placeholder="Почта" onChange={(event) => handleFieldChange('email', event.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ник в ТГ / ВК</label>
                <input type="text" value={draftProfileData.socialNick} placeholder="Ник в ТГ / ВК" onChange={(event) => handleFieldChange('socialNick', event.target.value)} />
              </div>
            </div>
          </section>

          <section className="profile-section upload-section">
            <div className="upload-row">
              <img
                className="upload-avatar"
                src={uploadPreviewAvatarSrc}
                alt="Аватар"
              />
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
            <button className="profile-delete-button" type="button" onClick={handleDeleteAvatar}>
              Удалить
            </button>
            <button className="profile-save-button" type="button" onClick={handleSave}>
              Сохранить
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
