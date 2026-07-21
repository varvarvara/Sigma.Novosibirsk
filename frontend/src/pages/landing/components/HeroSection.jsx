import { Link } from '@tanstack/react-router';
import { assets } from '../data/landingData';
export default function HeroSection({ registrationClosed = false, onRegistrationClosedClick }) {
  const handleClosedRegistrationClick = (event) => {
    event.preventDefault();
    onRegistrationClosedClick?.();
  };

  const registrationActionProps = registrationClosed
    ? { to: '/registration-closed', onClick: handleClosedRegistrationClick }
    : {};

  return (
    <section className="hero section" id="about">
      <div className="container hero__inner">
        <div className="hero__tags-group">
          <span className="chip chip--static">Сезон 2026</span>
          <span className="chip-divider" aria-hidden="true"></span>
          {registrationClosed ? (
            <button className="chip chip--link" type="button" onClick={onRegistrationClosedClick}>
              Регистрация закрыта <span aria-hidden="true">→</span>
            </button>
          ) : (
            <a className="chip chip--link" href="#contacts">
              Регистрация на сезон <span aria-hidden="true">→</span>
            </a>
          )}
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
          <Link
            className="button button--secondary"
            to="/setup-teacher"
            {...registrationActionProps}
          >
            Зарегистрироваться как преподаватель
          </Link>
          <Link
            className="button"
            to="/setup-student"
            {...registrationActionProps}
          >
            Зарегистрироваться как студент
          </Link>
        </div>

        <div className="hero__image-wrapper">
          <img className="hero__image" src={assets.heroImage} alt="Школьная доска и формулы Сигмы" />
        </div>
      </div>
    </section>
  );
}
