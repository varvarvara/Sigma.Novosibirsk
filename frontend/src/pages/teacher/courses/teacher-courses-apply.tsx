import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ENROLLMENT_SLOT_TIME_LABELS } from '../../../features/course-flow/enrollment-slot-times';
import { TeacherAppShell } from '../../../shared/ui/teacher_sidebar/teacher-app-shell';
import './teacher-courses-styles.css';

const SCHEDULE_DATES = ['23.07', '24.07', '25.07', '26.07', '27.07', '28.07', '29.07'] as const;

const TIME_SLOTS = Object.values(ENROLLMENT_SLOT_TIME_LABELS);

const DESCRIPTION_LIMIT = 275;

type CourseType = '' | 'Олимпиадный' | 'Авторский';

export const TeacherCoursesApplyPage = () => {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [syllabusLink, setSyllabusLink] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('');
  const [studentsLimit, setStudentsLimit] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string[]>>({});
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  const toggleSlot = (date: string, slot: string) => {
    setSelectedSlots((current) => {
      const slots = current[date] ?? [];
      const nextSlots = slots.includes(slot)
        ? slots.filter((item) => item !== slot)
        : [...slots, slot];

      return {
        ...current,
        [date]: nextSlots,
      };
    });
  };

  const selectedSlotsCount = Object.values(selectedSlots).reduce((count, slots) => count + slots.length, 0);
  const isFormValid =
    courseTitle.trim() &&
    syllabusLink.trim() &&
    description.trim() &&
    courseType &&
    studentsLimit.trim() &&
    selectedSlotsCount >= 3;

  const handleSave = () => {
    if (!isFormValid) {
      setShowValidationMessage(true);
      return;
    }

    navigate({ to: '/teacher/courses' });
  };

  return (
    <TeacherAppShell className="courses-layout">
      <main className="courses-content">
        <div className="courses-content-inner courses-content-inner--apply">
          <h1 className="courses-title">Курсы</h1>

          <form className="courses-form courses-form--apply" onSubmit={(event) => event.preventDefault()}>
            <div className="courses-form-field">
              <label htmlFor="course-apply-title">Название курса</label>
              <input
                id="course-apply-title"
                type="text"
                value={courseTitle}
                placeholder="Название курса"
                onChange={(event) => setCourseTitle(event.target.value)}
              />
            </div>

            <div className="courses-form-field">
              <label htmlFor="course-apply-syllabus">Ссылка на силлабус</label>
              <input
                id="course-apply-syllabus"
                type="text"
                value={syllabusLink}
                placeholder="Ссылка на силлабус"
                onChange={(event) => setSyllabusLink(event.target.value)}
              />
            </div>

            <div className="courses-form-field">
              <label htmlFor="course-apply-description">Описание</label>
              <textarea
                id="course-apply-description"
                value={description}
                maxLength={DESCRIPTION_LIMIT}
                placeholder="Описание"
                onChange={(event) => setDescription(event.target.value)}
              />
              <p className="courses-form-hint">{DESCRIPTION_LIMIT - description.length} знака осталось</p>
            </div>

            <div className="courses-form-field">
              <label htmlFor="course-apply-type">Тип курса</label>
              <select
                id="course-apply-type"
                value={courseType}
                required
                onChange={(event) => setCourseType(event.target.value as CourseType)}
              >
                <option value="">Выберите</option>
                <option value="Олимпиадный">Олимпиадный</option>
                <option value="Авторский">Авторский</option>
              </select>
            </div>

            <div className="courses-form-field">
              <label htmlFor="course-apply-capacity">Ограничения по количеству людей на курсе</label>
              <input
                id="course-apply-capacity"
                type="text"
                value={studentsLimit}
                placeholder="Количество"
                onChange={(event) => setStudentsLimit(event.target.value)}
              />
            </div>

            {SCHEDULE_DATES.map((date) => (
              <div key={date} className="courses-form-row">
                <div className="courses-form-field">
                  <label htmlFor={`course-apply-date-${date}`}>Дата</label>
                  <input id={`course-apply-date-${date}`} type="text" defaultValue={date} readOnly />
                </div>
                <div className="courses-form-field">
                  <label>Время</label>
                  <div className="course-time-slots" role="group" aria-label="Время">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`course-time-slot ${(selectedSlots[date] ?? []).includes(slot) ? 'course-time-slot--selected' : ''}`}
                        aria-pressed={(selectedSlots[date] ?? []).includes(slot)}
                        onClick={() => toggleSlot(date, slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="courses-action-bar">
              {showValidationMessage ? (
                <p className="courses-validation-message">
                  Заполните все поля и выберите хотя бы 3 временных слота
                </p>
              ) : null}
              <button type="button" className="btn-outline" onClick={() => navigate({ to: '/teacher/courses' })}>
                Удалить
              </button>
              <button type="button" className="btn-primary" onClick={handleSave}>
                Опубликовать
              </button>
            </div>
          </form>
        </div>
      </main>
    </TeacherAppShell>
  );
};
