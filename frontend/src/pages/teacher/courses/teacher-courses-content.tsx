import { useMemo, useState } from 'react';
import { AuthApiError } from '../../../entities/auth';
import {
  formatCourseStatusLabel,
  formatCourseTypeLabel,
} from '../../../entities/teacher/api/courses.api';
import type { TeacherCourse } from '../../../entities/teacher/model/courses.types';
import { useGetMyTeacherCourses } from '../../../entities/teacher/queries/courses.queries';
import './teacher-courses-styles.css';

const STAR_COUNT = 5;

function StarIcon({ fillPercent, index }: { fillPercent: number; index: number }) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));
  const gradientId = `course-rating-star-${index}-${Math.round(clampedFill)}`;

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset={`${clampedFill}%`} stopColor="#FDB022" />
          <stop offset={`${clampedFill}%`} stopColor="#E4E7EC" />
        </linearGradient>
      </defs>
      <path
        d="M12 3.5L14.6 8.76L20.4 9.6L16.2 13.7L17.2 19.5L12 16.7L6.8 19.5L7.8 13.7L3.6 9.6L9.4 8.76L12 3.5Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

function getStarFillPercent(averageRating: number | null | undefined, index: number) {
  if (averageRating == null || averageRating <= 0) {
    return 0;
  }

  const ratingInStars = Math.max(0, Math.min(STAR_COUNT, averageRating / 2));
  return Math.max(0, Math.min(1, ratingInStars - index)) * 100;
}

function CourseRatingStars({ course }: { course: TeacherCourse }) {
  const ratingInStars =
    course.average_rating == null ? 0 : Math.max(0, Math.min(STAR_COUNT, course.average_rating / 2));

  return (
    <div
      className="course-detail-rating"
      aria-label={
        course.feedback_count > 0 && course.average_rating != null
          ? `Рейтинг ${course.average_rating} из 10, ${ratingInStars.toFixed(1)} из ${STAR_COUNT} звёзд`
          : 'Пока нет оценок'
      }
    >
      {Array.from({ length: STAR_COUNT }).map((_, index) => (
        <StarIcon key={index} index={index} fillPercent={getStarFillPercent(course.average_rating, index)} />
      ))}
    </div>
  );
}

type StatusTab = 'all' | TeacherCourse['course_status'];

export default function TeacherCoursesContent() {
  const [statusTab, setStatusTab] = useState<StatusTab>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const {
    data: courses = [],
    isLoading,
    error,
  } = useGetMyTeacherCourses();

  const loadError =
    error instanceof AuthApiError
      ? error.message
      : error
        ? 'Не удалось загрузить курсы.'
        : null;

  const filteredCourses = useMemo(() => {
    if (statusTab === 'all') {
      return courses;
    }
    return courses.filter((course) => course.course_status === statusTab);
  }, [courses, statusTab]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;
  const selectedCourseCanShowDetails =
    selectedCourse?.course_status === 'Published' || selectedCourse?.course_status === 'Archived';

  const toggleCourseDetails = (courseId: number) => {
    setSelectedCourseId((current) => (current === courseId ? null : courseId));
  };

  return (
    <main className="courses-content">
      <div className="courses-content-inner">
        <h1 className="courses-title">Курсы</h1>

        {isLoading ? <p className="teacher-courses-status">Загрузка...</p> : null}
        {loadError ? <p className="teacher-courses-status teacher-courses-status--error">{loadError}</p> : null}
        {!isLoading && !loadError && courses.length === 0 ? (
          <p className="teacher-courses-status">
            У вас пока нет курсов. Создайте новый курс или дождитесь публикации после одобрения заявки.
          </p>
        ) : null}

        <div className="courses-tabs">
          <button
            type="button"
            className={`courses-tab ${statusTab === 'all' ? 'active' : ''}`}
            onClick={() => setStatusTab('all')}
          >
            Все
          </button>
          <button
            type="button"
            className={`courses-tab ${statusTab === 'Draft' ? 'active' : ''}`}
            onClick={() => setStatusTab('Draft')}
          >
            Созданные
          </button>
          <button
            type="button"
            className={`courses-tab ${statusTab === 'Published' ? 'active' : ''}`}
            onClick={() => setStatusTab('Published')}
          >
            Опубликованные
          </button>
          <button
            type="button"
            className={`courses-tab ${statusTab === 'Archived' ? 'active' : ''}`}
            onClick={() => setStatusTab('Archived')}
          >
            В архиве
          </button>
        </div>

        <div className="courses-mini-grid">
          {filteredCourses.map((course) => {
            const isExpanded = selectedCourseId === course.id;
            const canShowDetails = course.course_status === 'Published' || course.course_status === 'Archived';

            return (
              <div key={course.id} className={`course-mini-card${isExpanded ? ' course-mini-card--active' : ''}`}>
                <h3>{course.title}</h3>
                <p>{formatCourseStatusLabel(course.course_status)}</p>
                {canShowDetails ? (
                  <button type="button" onClick={() => toggleCourseDetails(course.id)}>
                    {isExpanded ? 'Свернуть' : 'Подробнее'}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {selectedCourse && selectedCourseCanShowDetails ? (
          <>
            <div className="course-divider" />

            <article className="course-detail-card">
              <div className="course-detail-header">
                <div className="course-detail-main">
                  <div className="course-detail-title-row">
                    <h3>{selectedCourse.title}</h3>
                    <CourseRatingStars course={selectedCourse} />
                  </div>

                  <p className="course-detail-desc">{selectedCourse.description ?? 'Без описания'}</p>

                  {selectedCourse.syllabus_url ? (
                    <a
                      className="course-syllabus-link"
                      href={selectedCourse.syllabus_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ссылка на силлабус
                    </a>
                  ) : (
                    <p className="course-syllabus-missing">Силлабус не указан</p>
                  )}

                  <div className="course-students-row">
                    <span className="course-tag">{formatCourseTypeLabel(selectedCourse.course_type)}</span>
                    <span className="students-count">
                      {selectedCourse.capacity != null ? `До ${selectedCourse.capacity} мест` : 'Без лимита мест'}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </>
        ) : null}
      </div>
    </main>
  );
}
