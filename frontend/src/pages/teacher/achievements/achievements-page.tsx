import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import './achievements-page.css';

type Student = {
  id: number;
  name: string;
  email: string;
  achievement: boolean[];
};

const navItems = [
  {
    id: 'attendance',
    label: 'Посещаемость',
    path: '/teacher/attendance',
    icon: '/teacher/sidebar/check-square.svg',
  },
  {
    id: 'achievements',
    label: 'Ачивки',
    path: '/teacher/achievements',
    icon: '/teacher/sidebar/sub_nav_courses/puls.svg',
  },
];

const initialStudents: Student[] = [
  { id: 1, name: 'Иванов Иван', email: 'ivanov@sigma.ru', achievement: [true, true, false, true, false, true] },
  { id: 2, name: 'Петрова Анна', email: 'petrova@sigma.ru', achievement: [false, true, false, true, true, false] },
  { id: 3, name: 'Смирнов Даниил', email: 'smirnov@sigma.ru', achievement: [true, false, true, true, false, true] },
  { id: 4, name: 'Соколова Мария', email: 'sokolova@sigma.ru', achievement: [true, true, true, false, true, true] },
  { id: 5, name: 'Орлов Никита', email: 'orlov@sigma.ru', achievement: [false, false, true, false, true, false] },
  { id: 6, name: 'Морозова Ева', email: 'morozova@sigma.ru', achievement: [true, true, false, true, true, true] },
  { id: 7, name: 'Волков Дмитрий', email: 'volkov@sigma.ru', achievement: [true, false, false, true, false, true] },
  { id: 8, name: 'Лебедева Анна', email: 'lebedeva@sigma.ru', achievement: [true, true, true, true, false, false] },
  { id: 9, name: 'Кузнецов Артем', email: 'kuznetsov@sigma.ru', achievement: [false, true, true, false, true, true] },
  { id: 10, name: 'Федорова Софья', email: 'fedorova@sigma.ru', achievement: [true, false, true, true, true, false] },
  { id: 11, name: 'Алексеев Павел', email: 'alekseev@sigma.ru', achievement: [false, false, true, true, false, true] },
  { id: 12, name: 'Николаева Елена', email: 'nikolaeva@sigma.ru', achievement: [true, true, false, false, true, true] },
  { id: 13, name: 'Громов Михаил', email: 'gromov@sigma.ru', achievement: [true, false, true, false, true, false] },
  { id: 14, name: 'Романова Алиса', email: 'romanova@sigma.ru', achievement: [false, true, false, true, true, true] },
  { id: 15, name: 'Ким Даниил', email: 'kim@sigma.ru', achievement: [true, true, true, false, false, true] },
  { id: 16, name: 'Попова Кира', email: 'popova@sigma.ru', achievement: [false, true, true, true, false, false] },
  { id: 17, name: 'Зайцев Максим', email: 'zaytsev@sigma.ru', achievement: [true, false, false, true, true, false] },
  { id: 18, name: 'Беляева Дарья', email: 'belyaeva@sigma.ru', achievement: [true, true, false, true, false, true] },
  { id: 19, name: 'Семенов Илья', email: 'semenov@sigma.ru', achievement: [false, false, true, false, true, true] },
  { id: 20, name: 'Васильева Полина', email: 'vasilyeva@sigma.ru', achievement: [true, true, true, true, true, false] },
  { id: 21, name: 'Макаров Роман', email: 'makarov@sigma.ru', achievement: [true, false, true, true, false, true] },
  { id: 22, name: 'Егорова Милана', email: 'egorova@sigma.ru', achievement: [false, true, false, true, true, false] },
  { id: 23, name: 'Павлов Кирилл', email: 'pavlov@sigma.ru', achievement: [true, true, false, false, true, true] },
  { id: 24, name: 'Тихонова Арина', email: 'tikhonova@sigma.ru', achievement: [false, true, true, true, false, true] },
  { id: 25, name: 'Мельникова Варвара', email: 'melnikova@sigma.ru', achievement: [true, false, true, true, false, true] },
];

const achievementColumns = ['Ачивка 1', 'Ачивка 2', 'Ачивка 3', 'Ачивка 4'];
const pageSize = 10;

export function TeacherAchievementsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState(initialStudents);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAchievementSaved, setIsAchievementSaved] = useState(false);
  const [editableStudentIds, setEditableStudentIds] = useState<number[]>([]);

  const filteredStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return students.slice(startIndex, startIndex + pageSize);
  }, [currentPage, students]);
  const pageCount = Math.ceil(students.length / pageSize);
  const goToPreviousPage = () => setCurrentPage((page) => Math.max(1, page - 1));
  const goToNextPage = () => setCurrentPage((page) => Math.min(pageCount, page + 1));

  const toggleAchievement = (id: number, columnIndex: number) => {
    if (isAchievementSaved && !editableStudentIds.includes(id)) {
      return;
    }

    setStudents((items) =>
      items.map((student) =>
        student.id === id
          ? {
              ...student,
              achievement: student.achievement.map((checked, index) => (index === columnIndex ? !checked : checked)),
            }
          : student,
      ),
    );
  };

  const clearAchievement = (id: number) => {
    setStudents((items) =>
      items.map((student) =>
        student.id === id
          ? { ...student, achievement: student.achievement.map(() => false) }
          : student,
      ),
    );
  };

  const editAchievement = (id: number) => {
    setEditableStudentIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  };

  const saveAchievement = () => {
    setIsAchievementSaved(true);
    setEditableStudentIds([]);
  };

  return (
    <main className="achievement-page" aria-label="Ачивки">
      <aside className="achievement-sidebar" aria-label="Основная навигация">
        <img className="achievement-sidebar__reference" src="/sidebar-teacher.svg" alt="" aria-hidden="true" />
        <button className="achievement-sidebar__hotspot achievement-sidebar__hotspot--logo achievement-clickable" type="button" aria-label="Главная" />
        <button className="achievement-sidebar__hotspot achievement-sidebar__hotspot--profile achievement-clickable" type="button" aria-label="Профиль" onClick={() => navigate({ to: '/teacher/profile' })} />
        <button className="achievement-sidebar__hotspot achievement-sidebar__hotspot--courses achievement-clickable" type="button" aria-label="Курсы" onClick={() => navigate({ to: '/teacher/courses' })} />
        <button className="achievement-sidebar__hotspot achievement-sidebar__hotspot--achievement achievement-sidebar__hotspot--active achievement-clickable" type="button" aria-label="Посещаемость" />
        <button className="achievement-sidebar__hotspot achievement-sidebar__hotspot--calendar achievement-clickable" type="button" aria-label="Расписание" />
        <button className="achievement-sidebar__hotspot achievement-sidebar__hotspot--settings achievement-clickable" type="button" aria-label="Настройки" onClick={() => navigate({ to: '/teacher/settings' })} />
        <button className="achievement-sidebar__hotspot achievement-sidebar__hotspot--avatar achievement-clickable" type="button" aria-label="Профиль" onClick={() => navigate({ to: '/teacher/profile' })} />
      </aside>

      <aside className="courses-subnav achievement-subnav" aria-label="Навигация раздела">
        <img className="achievement-subnav__reference" src="/subnav-teacher.svg" alt="" aria-hidden="true" />
        {navItems.map((item, index) => (
          <button
            key={item.id}
            className={`achievement-subnav__hotspot achievement-subnav__hotspot--${item.id} achievement-clickable${location.pathname === item.path && item.id === 'achievements' ? ' achievement-subnav__hotspot--active' : ''}`}
            type="button"
            onClick={() => navigate({ to: item.path })}
            aria-label={item.label}
            style={{ top: 36 + index * 56 }}
          />
        ))}
        <div className="achievement-subnav-user">
          <span>Имя фамилия</span>
          <span>teacher@sigma.ru</span>
        </div>
        <button className="achievement-subnav__hotspot achievement-subnav__hotspot--logout achievement-clickable" type="button" aria-label="Выход" />
      </aside>

      <section className="achievement-workspace">
        <header className="achievement-header">
          <div>
            <h1>Ачивки</h1>
            <div className="achievement-course-title-row">
              <p>Название курса</p>
              <span>{students.length} учеников</span>
            </div>
          </div>
        </header>

        <section className="achievement-panel" aria-label="Таблица ачивок">
          <div className="achievement-table" role="table">
            <div className="achievement-table-header" role="row">
              <span>Ученик</span>
              <span>Почта</span>
              {achievementColumns.map((column, index) => (
                <span key={`${column}-${index}`}>{column}</span>
              ))}
              <span>Ачивка</span>
              <span aria-hidden="true" />
            </div>
            <div className="achievement-table-body">
              {filteredStudents.map((student) => (
                <div className="achievement-row" role="row" key={student.id}>
                  <div className="achievement-student">
                    <img src="/teacher/sidebar/avatar.png" alt="" />
                    <div>
                      <strong>{student.name}</strong>
                    </div>
                  </div>
                  <span className="achievement-email">{student.email}</span>
                  {student.achievement.slice(0, 4).map((checked, index) => (
                    <label className="achievement-check" key={`${student.id}-${index}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isAchievementSaved && !editableStudentIds.includes(student.id)}
                        onChange={() => toggleAchievement(student.id, index)}
                      />
                      <span />
                    </label>
                  ))}
                  <div className="achievement-labels">
                    {Array.from({ length: Math.min(student.achievement.slice(0, 4).filter(Boolean).length, 3) }, (_, index) => (
                      <span key={`${student.id}-label-${index}`}>Label</span>
                    ))}
                    {Array.from({ length: 3 - Math.min(student.achievement.slice(0, 4).filter(Boolean).length, 3) }, (_, index) => (
                      <i key={`${student.id}-placeholder-${index}`} aria-hidden="true" />
                    ))}
                    {student.achievement.slice(0, 4).filter(Boolean).length > 0 && (
                      <span>+{student.achievement.slice(0, 4).filter(Boolean).length}</span>
                    )}
                  </div>
                  <div className="achievement-actions">
                    <button className="achievement-icon-button achievement-clickable" type="button" aria-label="Удалить" onClick={() => clearAchievement(student.id)}>
                      <img src="/Bin.svg" alt="" />
                    </button>
                    <button className="achievement-icon-button achievement-clickable" type="button" aria-label="Редактировать" onClick={() => editAchievement(student.id)}>
                      <img src="/Pen.svg" alt="" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="achievement-pagination-row">
          <button className="achievement-pagination-control achievement-clickable" type="button" onClick={goToPreviousPage}>
            Назад
          </button>
          <nav className="achievement-pagination" aria-label="Страницы">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
              <button
                className={`achievement-page-button achievement-clickable${currentPage === page ? ' achievement-page-button--active' : ''}`}
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </nav>
          <button className="achievement-pagination-control achievement-clickable" type="button" onClick={goToNextPage}>
            Вперед
          </button>
        </div>

        <div className="achievement-button-row">
        <button className="achievement-primary-button achievement-clickable" type="button" onClick={saveAchievement}>
          Сохранить изменения
        </button>
        </div>
      </section>
    </main>
  );
}
