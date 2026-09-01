import { assets } from '../data/landingData';

export default function NumbersSection() {
  return (
    <section className="section section--numbers" id="numbers">
      <div className="container">
        <div className="section-heading section-heading--split">
          <div>
            <h2>О Сигме в цифрах</h2>
          </div>
          <span className="chip chip--info">Информация на сезон 2025</span>
        </div>

        <div className="numbers-layout">
          <div className="numbers-grid">
            <article className="stat-card">
              <strong>28</strong>
              <h3>Преподавателей</h3>
              <p>ТомГУ (SAS), МВШЭН, НГУ ВШЭ, НГУ, МШУ Сколково, МГУ, СПбГУ, МГПУ</p>
            </article>

            <article className="stat-card">
              <strong>24</strong>
              <h3>Курса</h3>
              <p>
                Начиная от программирования и олимпиадной химии, заканчивая погружением в
                литературу и социологию
              </p>
            </article>

            <article className="stat-card">
              <strong>140</strong>
              <h3>Зарегистрировалось на сезон</h3>
              <p>Из Новосибирска и Новосибирской области, Бердска, Иркутска</p>
            </article>

            <article className="stat-card">
              <strong>∞</strong>
              <h3>Знаний</h3>
              <p>Было получено</p>
            </article>
          </div>

          <img className="numbers-image" src={assets.numbersImage} alt="Участники Сигмы на общей фотографии" />
        </div>
      </div>
    </section>
  );
}