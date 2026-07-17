import { useState } from 'react';
import { faqByAudience } from '../../data/landingData';

export default function FaqSection() {
  const [faqTab, setFaqTab] = useState('student');
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeFaqs = faqByAudience[faqTab];

  const handleTabChange = (tab) => {
    if (tab === faqTab || isTransitioning) return;
    setIsTransitioning(true);
    setOpenFaqIndex(-1);
    setTimeout(() => {
      setFaqTab(tab);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section className="section section--faq" id="faq">
      <div className="container faq-layout">
        <div className="section-heading section-heading--center">
          <h2>Часто задаваемые вопросы</h2>

          <div className="tab-group" role="tablist" aria-label="Вопросы по аудитории">
            <button
              type="button"
              className={faqTab === 'student' ? 'tab is-active' : 'tab'}
              onClick={() => handleTabChange('student')}
            >
              Ученик
            </button>
            <button
              type="button"
              className={faqTab === 'teacher' ? 'tab is-active' : 'tab'}
              onClick={() => handleTabChange('teacher')}
            >
              Преподаватель
            </button>
          </div>
        </div>

        <div className={`faq-list ${isTransitioning ? 'is-transitioning' : ''}`}>
          {activeFaqs.map((item, index) => {
            const isOpen = index === openFaqIndex;
            // Уникальный ключ на основе вкладки и индекса
            const key = `${faqTab}-${index}`;

            return (
              <article
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
                key={key}
                style={{ transitionDelay: isTransitioning ? '0s' : `${index * 0.08}s` }}
              >
                <button
                  type="button"
                  className="faq-item__button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-item__icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <div className={`faq-item__answer-wrapper ${isOpen ? 'is-open' : ''}`}>
                  <div className="faq-item__answer" dangerouslySetInnerHTML={{ __html: item.answer }} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}