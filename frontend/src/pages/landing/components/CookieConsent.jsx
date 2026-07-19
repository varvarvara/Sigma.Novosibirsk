import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleAccept = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      // TODO: сохранять согласие в localStorage
    }, 350);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      // TODO: запомнить, что пользователь закрыл баннер
    }, 350);
  };

  useEffect(() => {
    // Заглушка – в будущем проверка localStorage
    // const consent = localStorage.getItem('cookieConsent');
    // if (consent === 'true') setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`cookie-consent ${isClosing ? 'is-closing' : ''}`}>
      <div className="cookie-consent__inner">
        <div className="cookie-consent__content">
          <p className="cookie-consent__text">
            Мы используем cookies, необходимые для корректной работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с их использованием
          </p>
          <a
            className="cookie-consent__link"
            href="https://docs.google.com/document/d/1ZWNL0coo8hCAVavxULjpzD-QSduA70RSxyCJmbBvO9s/edit?tab=t.9ovi1kjmcze2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Политика обработки персональных данных
          </a>
        </div>

        <div className="cookie-consent__actions">
          <button className="cookie-consent__button" onClick={handleAccept}>
            Я соглашаюсь
          </button>
          <button
            className="cookie-consent__close"
            onClick={handleClose}
            aria-label="Закрыть уведомление"
          >
            <img src="/icons/krestik.svg" alt="Закрыть" />
          </button>
        </div>
      </div>
    </div>
  );
}