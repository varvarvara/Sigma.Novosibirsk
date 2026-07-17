import { useState } from 'react';
import { assets } from '../../data/landingData';

export default function FooterSection() {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('sigmaschoolnsk@yandex.ru');
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      const input = document.createElement('input');
      input.value = 'sigmaschoolnsk@yandex.ru';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <footer className="site-footer section" id="contacts">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="footer-title">Адрес проведения</p>
            <p className="footer-text footer-text--strong">Новосибирский государственный университет (НГУ)</p>
            <p className="footer-text">город Новосибирск, ул. Пирогова, д.1</p>
          </div>

          <div>
            <p className="footer-title">Контакты</p>
            <button
              className="footer-link footer-email-btn"
              onClick={handleCopyEmail}
              aria-label="Скопировать email"
            >
              sigmaschoolnsk@yandex.ru
            </button>
            {showCopied && (
              <span className="footer-copied-tooltip">Скопировано!</span>
            )}
          </div>

          <div>
            <p className="footer-title">Социальные сети</p>
            <a
              className="footer-social"
              href="https://vk.ru/sigma_nsk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={assets.footerVkIcon} alt="" />
              <span>Вконтакте</span>
            </a>
            <a
              className="footer-social"
              href="https://t.me/sigmaschoolnsk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={assets.footerTgIcon} alt="" />
              <span>Telegram</span>
            </a>
          </div>

          <div>
            <p className="footer-title">Документы</p>
            <a
              className="footer-link"
              href="https://docs.google.com/document/d/1ZWNL0coo8hCAVavxULjpzD-QSduA70RSxyCJmbBvO9s/edit?tab=t.0"
              target="_blank"
              rel="noopener noreferrer"
            >
              Политика Конфиденциальности
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Сигма.Новосибирск</span>
        </div>
      </div>
    </footer>
  );
}