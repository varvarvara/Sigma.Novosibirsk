import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import './setup-teacher-styles.css';

export function SetupTeacherNewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const [formData, setFormData] = useState({
    university: '',
    direction: '',
    course: '',
    courseInfo: '',
    courseType: '',
    courseDescription: '',
    firstName: '',
    lastName: '',
    patronymic: '',
    birthDate: '',
    phone: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBirthDatePartChange = (part: 'day' | 'month' | 'year', value: string) => {
    const digits = value.replace(/\D/g, '');
    const maxLength = part === 'year' ? 4 : 2;
    const trimmed = digits.slice(0, maxLength);

    if (part === 'day') {
      const day = Number(trimmed);

      if (trimmed.length === 2 && (day < 1 || day > 31)) {
        return;
      }
    }

    if (part === 'month') {
      const month = Number(trimmed);

      if (trimmed.length === 2 && (month < 1 || month > 12)) {
        return;
      }
    }

    setFormData((prev) => {
      const [day = '', month = '', year = ''] = prev.birthDate.split('.');
      const nextDate = {
        day,
        month,
        year,
        [part]: trimmed,
      };

      return { ...prev, birthDate: `${nextDate.day}.${nextDate.month}.${nextDate.year}` };
    });
  };

  const [birthDay = '', birthMonth = '', birthYear = ''] = formData.birthDate.split('.');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setStep(1);
    }, 800);
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Имитация отправки на сервер
    setTimeout(() => {
      console.log('Данные преподавателя:', formData);
      setIsLoading(false);
      navigate({ to: '/setup-teacher/success' });
    }, 800);
  };

  return (
    <div className="setup-teacher-container">
      {/* Левая колонка: форма */}
      <div className="setup-teacher-left">
        <div className="setup-teacher-content">

          <h1 className="setup-teacher-title">Зарегистрироваться</h1>

          {step === 1 ? (
            <form onSubmit={handleFinish} className="setup-teacher-form">
              <h2 className="setup-teacher-subtitle">Место обучения</h2>

              <div className="setup-teacher-input-group">
                <label htmlFor="university">Университет</label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="Введите название университета"
                  required
                />
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="direction">Направление</label>
                <input
                  type="text"
                  id="direction"
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  placeholder="Введите направление"
                  required
                />
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="course">Курс обучения</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1 курс</option>
                  <option value="2">2 курс</option>
                  <option value="3">3 курс</option>
                  <option value="4">4 курс</option>
                </select>
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="courseInfo">Информация о курсе</label>
                <div className="setup-teacher-subsection">
                  <div className="setup-teacher-input-row">
                    <input
                      type="text"
                      placeholder="Название курса"
                      value={formData.courseInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseInfo: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="setup-teacher-input-row">
                    <select
                      name="courseType"
                      value={formData.courseType}
                      onChange={handleChange}
                      required
                    >
                      <option value="Олимпиадный">Олимпиадный</option>
                      <option value="Авторский">Авторский</option>
                    </select>
                  </div>
                  <div className="setup-teacher-description-block">
                    <label htmlFor="courseDescription">Описание</label>
                    <textarea
                      id="courseDescription"
                      name="courseDescription"
                      value={formData.courseDescription}
                      onChange={handleChange}
                      maxLength={500}
                    />
                    <span>500 символов</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="setup-teacher-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Завершить регистрацию
                  </>
                ) : (
                  'Завершить регистрацию'
                )}
              </button>

              <p className="setup-teacher-footer">
                Уже есть аккаунт? <a href="/login" className="setup-teacher-link">Войти</a>
              </p>
            </form>
          ) : (
            // Шаг 2: Личная информация
            <form onSubmit={handleContinue} className="setup-teacher-form">
              <h2 className="setup-teacher-subtitle">Личная информация</h2>

              <div className="setup-teacher-input-group">
                <label htmlFor="firstName">Имя</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Введите имя"
                  required
                />
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="lastName">Фамилия</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Введите фамилию"
                  required
                />
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="patronymic">Отчество</label>
                <input
                  type="text"
                  id="patronymic"
                  name="patronymic"
                  value={formData.patronymic}
                  onChange={handleChange}
                  placeholder="Введите отчество"
                />
              </div>

              <div className="setup-teacher-input-group">
                <label>Дата рождения</label>
                <div className="setup-teacher-date-row">
                  <input type="text" placeholder="DD" value={birthDay} maxLength={2} onChange={(event) => handleBirthDatePartChange('day', event.target.value)} />
                  <input type="text" placeholder="MM" value={birthMonth} maxLength={2} onChange={(event) => handleBirthDatePartChange('month', event.target.value)} />
                  <input type="text" placeholder="YYYY" value={birthYear} maxLength={4} onChange={(event) => handleBirthDatePartChange('year', event.target.value)} />
                </div>
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="phone">Номер телефона</label>
                <div className="setup-teacher-phone-input">
                  <select className="setup-teacher-country-select">
                    <option>RUS</option>
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (ХХХ) ХХ-ХХ-ХХ"
                  />
                </div>
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@sigma.ru"
                  required
                />
              </div>

              <div className="setup-teacher-input-group">
                <label htmlFor="social">Ник в ТГ / ВК</label>
                <input
                  type="text"
                  id="social"
                  placeholder="@username"
                />
              </div>

              <div className="setup-teacher-consent">
                <label className="consent-card">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(event) => setConsentChecked(event.target.checked)}
                  />
                  <span>
                    Заполняя и отправляя форму, вы даете согласие на обработку персональных данных
                    и принимаете{' '}
                    <a
                      href="https://docs.google.com/document/d/1ZWNL0coo8hCAVavxULjpzD-QSduA70RSxyCJmbBvO9s/edit?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                    >
                      политику приватности
                    </a>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className={`setup-teacher-button ${consentChecked && !isLoading ? 'is-ready' : ''}`}
                disabled={isLoading || !consentChecked}
              >
                {isLoading ? 'Продолжить регистрацию' : 'Продолжить регистрацию'}
              </button>

              <p className="setup-teacher-footer">
                Уже есть аккаунт? <a href="/login" className="setup-teacher-link">Войти</a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Правая колонка: Декоративный элемент */}
      <div className="setup-teacher-right">
        <div className="setup-teacher-gradient"></div>
        {/* Большая звезда (выходит за рамки) */}
        <svg
          className="setup-teacher-star-big"
          width="1743"
          height="1495"
          viewBox="0 0 1743 1495"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M1380.46 182.716L1163.74 721.736L1742.41 936.883L1146.85 867.444L1134.64 1494.81L1005.22 872.481L0.00388986 1290.94L924.916 726.314L283.959 -0.000298724L1053.56 645.901L1380.46 182.716Z"
            fill="#7949FF"
            fillOpacity="0.5"
          />
        </svg>
      </div>
    </div>
  );
}
