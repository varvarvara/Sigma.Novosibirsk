import { assets, historyCards } from '../data/landingData';

export default function HistorySection() {
  return (
    <section className="section section--history" id="history">
      <div className="container">
        <div className="history-intro">
          <div className="section-heading">
            <h2>История Сигмы</h2>
            <p className="history-subtitle">
              С чего же начиналась данная история? Что происходило?
            </p>
          </div>
        </div>
      </div>

      {/* Изображение вне контейнера */}
      <div className="history-image-wrapper">
        <div className="history-phone-frame">
          <img
            className="history-hero-image"
            src={assets.historyHeroImage}
            alt="Аудитория со школьниками на лекции"
          />
        </div>
      </div>

      <div className="container">
        {/* Новый заголовок История Сигмы (меньше, по центру) */}
        <div className="history-second-heading">
          <h3>История Сигмы</h3>
        </div>

        {/* Карточки с подзаголовками */}
        <div className="history-cards">
          {historyCards.map((card, index) => {
            const yearLabels = ['Лето 2015', 'Лето 2023', 'Лето 2025'];
            return (
              <article className="history-card" key={card.title}>
                <h4 className="history-card__year">{yearLabels[index]}</h4>
                <img src={card.image} alt={card.title} />
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}