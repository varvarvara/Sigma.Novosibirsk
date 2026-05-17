import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { TeacherSidebar } from '../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import './teacher-courses-styles.css';
import { TeacherCoursesSubnav } from './teacher-courses-subnav';

const timeSlots = ['10:00-11:00', '11:20-12:20', '12:40-13:40'];
const descriptionLimit = 275;
const teacherCoursesStorageKey = 'teacherCourses';

export const TeacherCoursesApplyPage = () => {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [syllabusLink, setSyllabusLink] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState<'Олимпиадный' | 'Обычный'>('Олимпиадный');
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
  const isFormValid = courseTitle.trim() && syllabusLink.trim() && description.trim() && studentsLimit.trim() && selectedSlotsCount >= 3;

  const handleSave = () => {
    if (!isFormValid) {
      setShowValidationMessage(true);
      return;
    }

    const savedCourses = JSON.parse(localStorage.getItem(teacherCoursesStorageKey) ?? '[]');
    const nextCourse = {
      id: `course-${Date.now()}`,
      title: courseTitle.trim(),
      season: 'Сезон 2026',
      description: description.trim(),
      stars: 0,
      students: Number(studentsLimit) || 0,
      type: courseType,
      avatars: [],
    };

    localStorage.setItem(teacherCoursesStorageKey, JSON.stringify([...savedCourses, nextCourse]));
    navigate({ to: '/teacher/courses' });
  };

  return (
    <div className="courses-layout">
      <TeacherSidebar />
      <TeacherCoursesSubnav />

      <main className="courses-content">
        <div className="courses-content-inner">
          <h1 className="courses-title">Курсы</h1>

          <form className="courses-form">
            <div>
              <label>Название курса</label>
              <input type="text" value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} />
            </div>

            <div>
              <label>Ссылка на силлабус</label>
              <input type="text" value={syllabusLink} onChange={(event) => setSyllabusLink(event.target.value)} />
            </div>

            <div>
              <label>Описание</label>
              <textarea
                value={description}
                maxLength={descriptionLimit}
                onChange={(event) => setDescription(event.target.value)}
              />
              <div style={{ fontSize: '12px', color: '#98A2B3', marginTop: '6px' }}>
                {descriptionLimit - description.length} знака осталось
              </div>
            </div>

            <div>
              <label>Тип курса</label>
              <select value={courseType} onChange={(event) => setCourseType(event.target.value as 'Олимпиадный' | 'Обычный')}>
                <option value="Олимпиадный">Олимпиадный</option>
                <option value="Обычный">Авторский</option>
              </select>
            </div>

            <div>
              <label>Ограничения по количеству людей на курсе</label>
              <input type="text" value={studentsLimit} onChange={(event) => setStudentsLimit(event.target.value)} />
            </div>

            {["23.07", "24.07", "25.07", "26.07", "27.07", "28.07", "29.07"].map((date) => (
              <div key={date} className="courses-form-row">
                <div>
                  <label>Дата</label>
                  <input type="text" defaultValue={date} readOnly />
                </div>
                <div>
                  <label>Время</label>
                  <div className="course-time-slots" role="group" aria-label="Время">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`course-time-slot ${(selectedSlots[date] ?? []).includes(slot) ? 'course-time-slot--selected' : ''}`}
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
              {showValidationMessage && (
                <p className="courses-validation-message">Заполните все поля и выберите хотя бы 3 временных слота</p>
              )}
              <button type="button" className="btn-outline" onClick={() => navigate({ to: '/teacher/courses' })}>Удалить</button>
              <button type="button" className="btn-primary" onClick={handleSave}>Сохранить</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
