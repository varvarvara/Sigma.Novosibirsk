import { useState, useEffect } from 'react';

const COOKIE_CONSENT_NAME = 'sigma_cookie_consent';
const COOKIE_CONSENT_VALUE = 'accepted';
const COOKIE_EXPIRES_DAYS = 365;

function getCookieValue(name) {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')[1] ?? null;
}

function saveCookieConsent() {
  if (typeof document !== 'undefined') {
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    const expiresAt = new Date(Date.now() + COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${COOKIE_CONSENT_NAME}=${COOKIE_CONSENT_VALUE}; expires=${expiresAt}; path=/; SameSite=Lax${secureFlag}`;
  }

  try {
    localStorage.setItem(COOKIE_CONSENT_NAME, COOKIE_CONSENT_VALUE);
  } catch {
    // Если браузер ограничил localStorage, cookie всё равно остаётся основным источником согласия.
  }
}

function hasCookieConsent() {
  if (getCookieValue(COOKIE_CONSENT_NAME) === COOKIE_CONSENT_VALUE) {
    return true;
  }

  try {
    return localStorage.getItem(COOKIE_CONSENT_NAME) === COOKIE_CONSENT_VALUE;
  } catch {
    return false;
  }
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleAccept = () => {
    saveCookieConsent();
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 350);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 350);
  };

  useEffect(() => {
    if (hasCookieConsent()) {
      setIsVisible(false);
    }
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
