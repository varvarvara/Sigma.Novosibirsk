import { assets } from '../data/landingData';

export default function PartnersSection() {
  return (
    <section className="section section--partners" id="partners">
      <div className="container">
        <div className="section-heading section-heading--center">
          <h2>Наши партнёры</h2>
        </div>

        <div className="partners-logos">
          <a
            href="https://www.nsu.ru/n/information-technologies-department/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={assets.partnerNguLogo} alt="Логотип НГУ ФИТ" />
          </a>
          <a
            href="https://www.skolkovo.ru"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={assets.partnerSkolkovoLogo} alt="Логотип Сколково" />
          </a>
          <a
            href="https://www.spotandchoos.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={assets.partnerSchLogo} alt="Логотип Spot & Choos" />
          </a>
          <a
            href="https://alfabank.ru/alfafuture/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="partners-logos__logo partners-logos__logo--alfabank"
              src={assets.partnerAlfaBankLogo}
              alt="Логотип Альфа Будущее и Альфа-Банк"
            />
          </a>
        </div>

        <div className="partner-panel">
          <div className="partner-panel__text">
            <h3>Стать нашим партнёром</h3>
            <p>
              Мы открыты к сотрудничеству: финансовой поддержке, предоставлению площадки или помощи
              с оборудованием. Напишите нам — обсудим формат.
            </p>
          </div>
          <a
            className="button partner-panel__button"
            href="https://t.me/tarinaip"
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать
          </a>
        </div>
      </div>
    </section>
  );
}
