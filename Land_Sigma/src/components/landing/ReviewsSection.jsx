import { useState } from 'react';
import { reviewsByAudience } from '../../data/landingData';

export default function ReviewsSection() {
  const [reviewsTab, setReviewsTab] = useState('students');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const displayedReviews = reviewsByAudience[reviewsTab];

  const handleTabChange = (tab) => {
    if (tab === reviewsTab || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setReviewsTab(tab);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section className="section section--reviews" id="reviews">
      <div className="container">
        <div className="reviews-wrapper">
          <div className="section-heading section-heading--center">
            <h2>Отзывы</h2>
            <div className="tab-group">
              <button
                type="button"
                className={reviewsTab === 'students' ? 'tab is-active' : 'tab'}
                onClick={() => handleTabChange('students')}
              >
                Ученики
              </button>
              <button
                type="button"
                className={reviewsTab === 'teachers' ? 'tab is-active' : 'tab'}
                onClick={() => handleTabChange('teachers')}
              >
                Преподаватели
              </button>
            </div>
          </div>

          <div className={`reviews-list ${isTransitioning ? 'is-transitioning' : ''}`}>
            {displayedReviews.map((review, index) => {
              const isRight = index % 2 === 1;
              return (
                <article
                  className={`review-item ${isRight ? 'review-item--right' : 'review-item--left'}`}
                  key={review.name}
                  style={{ transitionDelay: isTransitioning ? '0s' : `${index * 0.08}s` }}
                >
                  <div className="review-item__avatar-block">
                    <div className="review-item__avatar">
                      <img src={`/images/review/${review.avatar}`} alt={review.name} />
                    </div>
                    <div className="review-item__meta">
                      <strong>{review.name}</strong>
                      <span dangerouslySetInnerHTML={{ __html: review.role }} />
                    </div>
                  </div>

                  <div className="review-item__content">
                    <p className="review-item__quote">
                      «<span dangerouslySetInnerHTML={{ __html: review.quote }} />»
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}