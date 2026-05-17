import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { TeacherSidebar } from '../../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-settings-styles.css';

export const TeacherSettingsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: 'Оливия',
    lastName: 'Ричардсон',
    patronymic: '',
    birthDay: '15',
    birthMonth: '03',
    birthYear: '1998',
    email: 'olivia@untitledui.com',
    phoneCountry: 'RUS',
    phoneNumber: '+7 (555) 000-00-00',
    university: 'МГУ им. М.В. Ломоносова',
    direction: 'Информатика и вычислительная техника',
    course: '',
    socialNick: '',
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'save' | 'delete' | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    setConfirmAction('save');
    setShowConfirmModal(true);
  };

  const handleDelete = () => {
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const handleLogout = () => {
    navigate({ to: '/login' });
  };

  const handleConfirm = () => {
    if (confirmAction === 'save') {
      console.log('Профиль сохранен:', formData);
    } else if (confirmAction === 'delete') {
      console.log('Профиль удален');
    }
    setShowConfirmModal(false);
  };

  return (
    <div className="teacher-settings-container">
      <TeacherSidebar />
      
      <main className="teacher-settings-content">
        {/* Градиент заголовок */}
        <div className="settings-header-gradient">
          <div className="settings-header-card">
            <div className="settings-header-content">
              <img
                src="/teacher/profile/avatar-profile.png"
                alt="Аватар профиля"
                className="settings-avatar-large"
              />
              <div className="settings-user-info">
                <h1>ФИО</h1>
                <p>{formData.email}</p>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Выйти из аккаунта
            </button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="settings-card">
          <form className="settings-form">
            <section className="settings-section">
              <h2>Личная информация</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Имя</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Фамилия</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Отчество</label>
                  <input
                    type="text"
                    name="patronymic"
                    value={formData.patronymic}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row birth-row">
                <div className="form-group small">
                  <label>Дата рождения</label>
                  <input
                    type="text"
                    name="birthDay"
                    placeholder="DD"
                    value={formData.birthDay}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group small">
                  <label className="sr-only">Месяц</label>
                  <input
                    type="text"
                    name="birthMonth"
                    placeholder="MM"
                    value={formData.birthMonth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group small">
                  <label className="sr-only">Год</label>
                  <input
                    type="text"
                    name="birthYear"
                    placeholder="YYYY"
                    value={formData.birthYear}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            <section className="settings-section">
              <h2>Место обучения</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Университет</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Направление</label>
                  <input
                    type="text"
                    name="direction"
                    value={formData.direction}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group select">
                  <label>Курс обучения</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                  >
                    <option value="">Выберите</option>
                    <option value="1 курс">1 курс</option>
                    <option value="2 курс">2 курс</option>
                    <option value="3 курс">3 курс</option>
                    <option value="4 курс">4 курс</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="settings-section">
              <h2>Контакты</h2>
              <div className="form-row">
                <div className="form-group phone">
                  <label>Номер телефона</label>
                  <div className="phone-input">
                    <select
                      name="phoneCountry"
                      value={formData.phoneCountry}
                      onChange={handleInputChange}
                    >
                      <option value="RUS">RUS</option>
                    </select>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ник в ТГ / ВК</label>
                  <input
                    type="text"
                    name="socialNick"
                    value={formData.socialNick}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            <section className="settings-section upload-section">
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

            <div className="settings-actions">
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
              >
                Удалить
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleSave}
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Модаль подтверждения */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">
              {confirmAction === 'save' ? 'Сохранить изменения?' : 'Удалить профиль?'}
            </h2>
            <p className="modal-message">
              {confirmAction === 'save' 
                ? 'Вы уверены, что хотите сохранить все изменения?' 
                : 'Вы уверены, что хотите удалить свой профиль? Это действие необратимо.'}
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Отмена
              </button>
              <button 
                className="modal-btn modal-btn-confirm"
                onClick={handleConfirm}
              >
                ОК
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
