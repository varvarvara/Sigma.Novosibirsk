import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import './setup-student-styles.css';

export function SetupStudentPage() {
  const [consentChecked, setConsentChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    school: '',
    grade: '',
    address: '',
    phone: '',
    social: '',
    parentName: '',
    parentPhone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.substring(1);
    }

    if (digits.length === 0) {
      setFormData((prev) => ({ ...prev, [name]: '' }));
      return;
    }

    let formatted = '+7 ';
    if (digits.length > 0) {
      formatted += '(' + digits.substring(0, 3);
    }
    if (digits.length >= 4) {
      formatted += ')-' + digits.substring(3, 6);
    }
    if (digits.length >= 7) {
      formatted += '-' + digits.substring(6, 8);
    }
    if (digits.length >= 9) {
      formatted += '-' + digits.substring(8, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Отправляем данные студента:', formData);
  };

  return (
    <div className="setup-student-container">
      <div className="setup-student-left">
        <div className="setup-student-content">
          <h1 className="setup-student-title">Зарегистрироваться</h1>

          <form onSubmit={handleSubmit} className="setup-student-form">
            <section className="setup-student-section">
              <h2 className="setup-student-subtitle">Настройка аккаунта</h2>
              <div className="setup-student-grid">
                <div className="setup-student-input-group full-width">
                  <label htmlFor="email">Почта</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    required
                  />
                </div>
                <div className="setup-student-input-group">
                  <label htmlFor="password">Пароль</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="setup-student-input-group">
                  <label htmlFor="confirmPassword">Повторите пароль</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </section>

            <section className="setup-student-section">
              <h2 className="setup-student-subtitle">Личная информация</h2>
              <div className="setup-student-grid">
                <div className="setup-student-input-group">
                  <label htmlFor="firstName">Имя</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="setup-student-input-group">
                  <label htmlFor="lastName">Фамилия</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="setup-student-input-group full-width">
                  <label htmlFor="middleName">Отчество</label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>
                <div className="setup-student-input-group full-width">
                  <label>Дата рождения</label>
                  <div className="setup-student-date-row">
                    <input
                      type="text"
                      name="birthDay"
                      value={formData.birthDay}
                      onChange={handleChange}
                      placeholder="DD"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      name="birthMonth"
                      value={formData.birthMonth}
                      onChange={handleChange}
                      placeholder="MM"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleChange}
                      placeholder="YYYY"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="setup-student-input-group full-width">
                  <label htmlFor="school">Место обучения</label>
                  <input
                    type="text"
                    id="school"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="setup-student-input-group full-width">
                  <label htmlFor="grade">Класс (на 2026-2027 учебный год)</label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Выберите класс
                    </option>
                    <option value="9">9 класс</option>
                    <option value="10">10 класс</option>
                    <option value="11">11 класс</option>
                  </select>
                </div>
                <div className="setup-student-input-group full-width">
                  <label htmlFor="address">Адрес проживания</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="setup-student-section">
              <h2 className="setup-student-subtitle">Контакты</h2>
              <div className="setup-student-grid">
                <div className="setup-student-input-group full-width">
                  <label htmlFor="phone">Номер телефона</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (XXX)-XXX-XX-XX"
                    required
                  />
                </div>
                <div className="setup-student-input-group full-width">
                  <label htmlFor="social">Ник в Telegram / Вконтакте</label>
                  <input
                    type="text"
                    id="social"
                    name="social"
                    value={formData.social}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            <section className="setup-student-section">
              <h2 className="setup-student-subtitle">Информация о родителе / опекуне</h2>
              <div className="setup-student-grid">
                <div className="setup-student-input-group full-width">
                  <label htmlFor="parentName">ФИО родителя / опекуна</label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="setup-student-input-group full-width">
                  <label htmlFor="parentPhone">Номер телефона родителя / опекуна</label>
                  <input
                    type="tel"
                    id="parentPhone"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (XXX)-XXX-XX-XX"
                    required
                  />
                </div>
              </div>
            </section>

            <div className="setup-student-consent">
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
              className={`setup-student-button ${consentChecked ? 'is-ready' : ''}`}
              disabled={!consentChecked}
            >
              Завершить регистрацию
            </button>

            <p className="setup-student-footer">
              Уже есть аккаунт? <Link to="/login" className="setup-student-link">Войти</Link>
            </p>
          </form>
        </div>
      </div>

      <div className="setup-student-right">
        <div className="setup-student-gradient"></div>
        <svg
          className="setup-student-star-big"
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
