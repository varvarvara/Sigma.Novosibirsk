import { principles } from '../../data/landingData';

export default function PrinciplesSection() {
  return (
    <section className="section section--principles" id="principles">
      <div className="container">
        <div className="section-heading section-heading--center">
          <h2>Наши принципы</h2>
          <p className="section-copy">
            Школа выросла из стремления объединить людей, которым по-настоящему интересны
            образование, наука и совместное развитие. Для нас это не просто набор курсов и не просто
            летняя программа для школьников. «Сигма» — это пространство, в котором встречаются
            ученики, преподаватели и организаторы, чтобы вместе думать, исследовать, пробовать новое
            и передавать друг другу опыт.
          </p>
        </div>

        <div className="principles-grid">
          {principles.map((principle) => (
            <article className="principle-card" key={principle.title}>
              <div className="principle-card__icon-outer">
                <div className="principle-card__icon-inner">
                  <img src={principle.icon} alt="" aria-hidden="true" />
                </div>
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}