import { useState } from 'react';
import { assets } from '../../data/landingData';
import RegistrationModal from '../RegistrationModal';

export default function HeroSection({ config }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 350);
  };

  const handleRegistrationClick = (role) => {
    if (config) {
      const now = new Date();
      const start = new Date(config.registration.startDate);
      const end = new Date(config.registration.endDate);
      if (now >= start && now <= end) {
        // Регистрация открыта — переходим на страницу регистрации
        window.location.href = '#contacts'; // или реальный URL
      } else {
        openModal(); // Показываем окно о завершении
      }
    } else {
      // Если конфиг не загружен, показываем окно по умолчанию (защита)
      openModal();
    }
  };

  return (
    <section className="hero section" id="about">
      <div className="container hero__inner">
        <div className="hero__tags-group">
          <span className="chip chip--static">Сезон 2026</span>
          <span className="chip-divider" aria-hidden="true"></span>
          <a className="chip chip--link" href="#contacts">
            Регистрация не сезон! <span aria-hidden="true">→</span>
          </a>
        </div>

        <h1 className="hero__title">Летняя школа Сигма.Новосибирск</h1>

        <div className="hero__text-container">
          <p className="hero__text">
            «Сигма» — бесплатная летняя научно-олимпиадная школа для 9–11 классов.
          </p>
          <p className="hero__text">
            Неважен уровень — главное твой интерес к науке. Нескучные уроки и общение с единомышленниками ждут!
          </p>
        </div>

        <div className="hero__actions">
          <a
            className="button button--secondary"
            onClick={(e) => {
              e.preventDefault();
              handleRegistrationClick('teacher');
            }}
            href="#"
          >
            Зарегистрироваться как преподаватель
          </a>
          <a
            className="button"
            onClick={(e) => {
              e.preventDefault();
              handleRegistrationClick('student');
            }}
            href="#"
          >
            Зарегистрироваться как студент
          </a>
        </div>

        <div className="hero__image-wrapper">
          <img className="hero__image" src={assets.heroImage} alt="Школьная доска и формулы Сигмы" />
        </div>
      </div>

      <RegistrationModal isOpen={isModalOpen} isClosing={isClosing} onClose={closeModal} />
    </section>
  );
}