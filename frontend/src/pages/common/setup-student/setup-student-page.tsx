import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AuthStarPanel } from '../../../features/auth/ui/auth-star-panel';
import { ChevronDown } from '@untitledui/icons/ChevronDown';
import { Eye } from '@untitledui/icons/Eye';
import { EyeOff } from '@untitledui/icons/EyeOff';
import { validateBirthDateLive } from '../../../features/auth/birth-date-validation';
import { RegistrationConsentText } from '../../../features/auth/ui/registration-consent-text';
import {
  getRegistrationErrorMessage,
  registerStudentAndLogin,
  validateStudentRegistration,
  type StudentRegistrationErrors,
} from '../../../features/auth/student-registration';
import '../../../styles/field-error.css';
import './setup-student-styles.css';

type ErrorField = keyof StudentRegistrationErrors;

const BIRTH_FIELD_NAMES = new Set(['birthDay', 'birthMonth', 'birthYear']);

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

function inputClassName(hasError: boolean, extraClass = '') {
  return ['setup-student-control', extraClass, hasError ? 'field-input--error' : '']
    .filter(Boolean)
    .join(' ');
}

export function SetupStudentPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState<StudentRegistrationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    parentPhone: '',
  });

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };

      if (fieldName in next) {
        delete next[fieldName as ErrorField];
      }

      if (BIRTH_FIELD_NAMES.has(fieldName)) {
        delete next.birthDate;
      }

      if (fieldName === 'consent') {
        delete next.consent;
      }

      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
    setFormError(null);
  };

  const updateBirthDateFieldError = (day: string, month: string, year: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      const birthDateError = validateBirthDateLive(day, month, year);

      if (birthDateError) {
        next.birthDate = birthDateError;
      } else {
        delete next.birthDate;
      }

      return next;
    });
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const maxLength = name === 'birthYear' ? 4 : 2;
    const nextValue = value.replace(/\D/g, '').slice(0, maxLength);
    const nextDay = name === 'birthDay' ? nextValue : formData.birthDay;
    const nextMonth = name === 'birthMonth' ? nextValue : formData.birthMonth;
    const nextYear = name === 'birthYear' ? nextValue : formData.birthYear;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    updateBirthDateFieldError(nextDay, nextMonth, nextYear);
    setFormError(null);
  };

  const handleBirthDateBlur = () => {
    updateBirthDateFieldError(formData.birthDay, formData.birthMonth, formData.birthYear);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.substring(1);
    }

    if (digits.length === 0) {
      setFormData((prev) => ({ ...prev, [name]: '' }));
      clearFieldError(name);
      setFormError(null);
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
    clearFieldError(name);
    setFormError(null);
  };

  const handleConsentChange = (checked: boolean) => {
    setConsentChecked(checked);
    if (checked) {
      clearFieldError('consent');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nextErrors = validateStudentRegistration(formData, { consentAccepted: consentChecked });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await registerStudentAndLogin(formData);
      navigate({ to: '/profile' });
    } catch (error) {
      setFormError(getRegistrationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="setup-student-container">
      <div className="setup-student-left">
        <div className="setup-student-content">
          <h1 className="setup-student-title">Зарегистрироваться</h1>

          <form onSubmit={handleSubmit} className="setup-student-form" noValidate>
            {formError ? <p className="field-error setup-student-form-error">{formError}</p> : null}

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
                    className={inputClassName(Boolean(errors.email))}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'setup-email-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-email-error" message={errors.email} />
                </div>

                <div className="setup-student-input-group">
                  <label htmlFor="password">Пароль</label>
                  <div className="setup-student-password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className={inputClassName(Boolean(errors.password), 'setup-student-input--with-icon')}
                      value={formData.password}
                      onChange={handleChange}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'setup-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="setup-student-password-toggle"
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={16} color="#2A2730" /> : <Eye size={16} color="#2A2730" />}
                    </button>
                  </div>
                  <FieldErrorMessage id="setup-password-error" message={errors.password} />
                </div>

                <div className="setup-student-input-group">
                  <label htmlFor="confirmPassword">Повторите пароль</label>
                  <div className="setup-student-password-wrap">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      className={inputClassName(Boolean(errors.confirmPassword), 'setup-student-input--with-icon')}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      aria-describedby={errors.confirmPassword ? 'setup-confirm-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className="setup-student-password-toggle"
                      aria-label={showConfirmPassword ? 'Скрыть повтор пароля' : 'Показать повтор пароля'}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} color="#2A2730" />
                      ) : (
                        <Eye size={16} color="#2A2730" />
                      )}
                    </button>
                  </div>
                  <FieldErrorMessage id="setup-confirm-password-error" message={errors.confirmPassword} />
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
                    className={inputClassName(Boolean(errors.firstName))}
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'setup-first-name-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-first-name-error" message={errors.firstName} />
                </div>

                <div className="setup-student-input-group">
                  <label htmlFor="lastName">Фамилия</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClassName(Boolean(errors.lastName))}
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'setup-last-name-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-last-name-error" message={errors.lastName} />
                </div>

                <div className="setup-student-input-group full-width">
                  <label htmlFor="middleName">Отчество</label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className={inputClassName(false)}
                  />
                </div>

                <div className="setup-student-input-group full-width">
                  <label>Дата рождения</label>
                  <div className="setup-student-date-row">
                    <input
                      type="text"
                      name="birthDay"
                      inputMode="numeric"
                      value={formData.birthDay}
                      onChange={handleBirthDateChange}
                      onBlur={handleBirthDateBlur}
                      placeholder="DD"
                      maxLength={2}
                      className={inputClassName(Boolean(errors.birthDate))}
                      aria-invalid={errors.birthDate ? 'true' : 'false'}
                    />
                    <input
                      type="text"
                      name="birthMonth"
                      inputMode="numeric"
                      value={formData.birthMonth}
                      onChange={handleBirthDateChange}
                      onBlur={handleBirthDateBlur}
                      placeholder="MM"
                      maxLength={2}
                      className={inputClassName(Boolean(errors.birthDate))}
                      aria-invalid={errors.birthDate ? 'true' : 'false'}
                    />
                    <input
                      type="text"
                      name="birthYear"
                      inputMode="numeric"
                      value={formData.birthYear}
                      onChange={handleBirthDateChange}
                      onBlur={handleBirthDateBlur}
                      placeholder="YYYY"
                      maxLength={4}
                      className={inputClassName(Boolean(errors.birthDate))}
                      aria-invalid={errors.birthDate ? 'true' : 'false'}
                      aria-describedby={errors.birthDate ? 'setup-birth-date-error' : undefined}
                    />
                  </div>
                  <FieldErrorMessage id="setup-birth-date-error" message={errors.birthDate} />
                </div>

                <div className="setup-student-input-group full-width">
                  <label htmlFor="school">Место обучения</label>
                  <input
                    type="text"
                    id="school"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className={inputClassName(Boolean(errors.school))}
                    aria-invalid={errors.school ? 'true' : 'false'}
                    aria-describedby={errors.school ? 'setup-school-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-school-error" message={errors.school} />
                </div>

                <div className="setup-student-input-group full-width">
                  <label htmlFor="grade">Класс (на 2026-2027 учебный год)</label>
                  <div className="setup-student-select-wrap">
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className={inputClassName(
                        Boolean(errors.grade),
                        formData.grade ? '' : 'setup-student-select--empty',
                      )}
                      aria-invalid={errors.grade ? 'true' : 'false'}
                      aria-describedby={errors.grade ? 'setup-grade-error' : undefined}
                    >
                      <option value="" disabled hidden>
                        Выберите класс
                      </option>
                      <option value="9">9 класс</option>
                      <option value="10">10 класс</option>
                      <option value="11">11 класс</option>
                    </select>
                    <ChevronDown className="setup-student-select-icon" size={16} color="#2A2730" aria-hidden />
                  </div>
                  <FieldErrorMessage id="setup-grade-error" message={errors.grade} />
                </div>

                <div className="setup-student-input-group full-width">
                  <label htmlFor="address">Адрес проживания</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClassName(Boolean(errors.address))}
                    aria-invalid={errors.address ? 'true' : 'false'}
                    aria-describedby={errors.address ? 'setup-address-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-address-error" message={errors.address} />
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
                    className={inputClassName(Boolean(errors.phone))}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    aria-describedby={errors.phone ? 'setup-phone-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-phone-error" message={errors.phone} />
                </div>

                <div className="setup-student-input-group full-width">
                  <label htmlFor="social">Ник в Telegram / Вконтакте</label>
                  <input
                    type="text"
                    id="social"
                    name="social"
                    value={formData.social}
                    onChange={handleChange}
                    className={inputClassName(false)}
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
                    className={inputClassName(Boolean(errors.parentName))}
                    aria-invalid={errors.parentName ? 'true' : 'false'}
                    aria-describedby={errors.parentName ? 'setup-parent-name-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-parent-name-error" message={errors.parentName} />
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
                    className={inputClassName(Boolean(errors.parentPhone))}
                    aria-invalid={errors.parentPhone ? 'true' : 'false'}
                    aria-describedby={errors.parentPhone ? 'setup-parent-phone-error' : undefined}
                  />
                  <FieldErrorMessage id="setup-parent-phone-error" message={errors.parentPhone} />
                </div>
              </div>
            </section>

            <div className="setup-student-consent">
              <label className={`consent-card${errors.consent ? ' consent-card--error' : ''}`}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(event) => handleConsentChange(event.target.checked)}
                  aria-invalid={errors.consent ? 'true' : 'false'}
                  aria-describedby={errors.consent ? 'setup-consent-error' : undefined}
                />
                <span>
                  <RegistrationConsentText
                    personalDataUrl={import.meta.env.VITE_PERSONAL_DATA_STUDENT_URL}
                  />
                </span>
              </label>
              <FieldErrorMessage id="setup-consent-error" message={errors.consent} />
            </div>

            <button
              type="submit"
              className={`setup-student-button ${consentChecked ? 'is-ready' : ''}`}
              disabled={!consentChecked || isSubmitting}
            >
              {isSubmitting ? 'Отправка…' : 'Завершить регистрацию'}
            </button>
          </form>
        </div>
      </div>

      <AuthStarPanel />
    </div>
  );
}
