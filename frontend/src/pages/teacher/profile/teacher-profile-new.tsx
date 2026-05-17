import { useNavigate } from '@tanstack/react-router';
import { TeacherSidebar } from '../../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-profile-new-styles.css';

export const TeacherProfileNewPage = () => {
  const navigate = useNavigate();

  // Временные данные профиля
  const profileData = {
    firstName: 'Оливия',
    lastName: 'Ричардсон',
    patronymic: '',
    email: 'olivia@untitledui.com',
    birthDay: '15',
    birthMonth: '03',
    birthYear: '1998',
    phoneCountry: 'RUS',
    phoneNumber: '+7 (555) 000-00-00',
    university: 'МГУ им. М.В. Ломоносова',
    direction: 'Информатика и вычислительная техника',
    course: '',
    socialNick: '',
  };

  const handleLogout = () => {
    navigate({ to: '/login' });
  };

  return (
    <div className="teacher-profile-container">
      <TeacherSidebar />
      
      <main className="teacher-profile-content">
        {/* Градиент заголовок */}
        <div className="profile-header-gradient">
          <div className="profile-header-card">
            <div className="profile-header-content">
              <img
                src="/teacher/profile/avatar-profile.png"
                alt="Аватар профиля"
                className="profile-avatar-large"
              />
              <div className="profile-user-info">
                <h1>ФИО</h1>
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
                <input type="text" value={profileData.firstName} readOnly />
              </div>
              <div className="form-group">
                <label>Фамилия</label>
                <input type="text" value={profileData.lastName} readOnly />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Отчество</label>
                <input type="text" value={profileData.patronymic} readOnly />
              </div>
            </div>
            <div className="form-row birth-row">
              <div className="form-group small">
                <label>Дата рождения</label>
                <input type="text" value={profileData.birthDay} readOnly />
              </div>
              <div className="form-group small">
                <label className="sr-only">Месяц</label>
                <input type="text" value={profileData.birthMonth} readOnly />
              </div>
              <div className="form-group small">
                <label className="sr-only">Год</label>
                <input type="text" value={profileData.birthYear} readOnly />
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Место обучения</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Университет</label>
                <input type="text" value={profileData.university} readOnly />
              </div>
              <div className="form-group">
                <label>Направление</label>
                <input type="text" value={profileData.direction} readOnly />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group select">
                <label>Курс обучения</label>
                <input type="text" value={profileData.course} readOnly />
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Контакты</h2>
            <div className="form-row">
              <div className="form-group phone">
                <label>Номер телефона</label>
                <div className="phone-input">
                  <input type="text" value={profileData.phoneCountry} readOnly />
                  <input type="text" value={profileData.phoneNumber} readOnly />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={profileData.email} readOnly />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ник в ТГ / ВК</label>
                <input type="text" value={profileData.socialNick} readOnly />
              </div>
            </div>
          </section>

          <section className="profile-section upload-section">
            <div className="upload-row">
              <img
                className="upload-avatar"
                src="/teacher/profile/avatar-profile.png"
                alt="Аватар"
              />
              <div className="upload-dropzone">
                <img
                  className="upload-icon"
                  src="/teacher/profile/upload-cloud.svg"
                  alt="Загрузка"
                />
                <p>Нажмите или перетащите</p>
                <span>SVG, PNG, JPG or GIF (max. 800x400px)</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
