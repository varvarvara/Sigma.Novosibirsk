import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { TeacherSidebar } from '../../shared/ui/teacher_sidebar/teacher-sidebar';
import '../../shared/ui/teacher_sidebar/teacher-sidebar-styles.css';
import '../teacher_courses_page/teacher-courses-styles.css';
import './attendance.css';

type Student = {
  id: number;
  name: string;
  email: string;
  attendance: boolean[];
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
  { id: 1, name: 'Иванов Иван', email: 'ivanov@sigma.ru', attendance: [true, true, false, true, false, true] },
  { id: 2, name: 'Петрова Анна', email: 'petrova@sigma.ru', attendance: [false, true, false, true, true, false] },
  { id: 3, name: 'Смирнов Даниил', email: 'smirnov@sigma.ru', attendance: [true, false, true, true, false, true] },
  { id: 4, name: 'Соколова Мария', email: 'sokolova@sigma.ru', attendance: [true, true, true, false, true, true] },
  { id: 5, name: 'Орлов Никита', email: 'orlov@sigma.ru', attendance: [false, false, true, false, true, false] },
  { id: 6, name: 'Морозова Ева', email: 'morozova@sigma.ru', attendance: [true, true, false, true, true, true] },
  { id: 7, name: 'Волков Дмитрий', email: 'volkov@sigma.ru', attendance: [true, false, false, true, false, true] },
  { id: 8, name: 'Лебедева Анна', email: 'lebedeva@sigma.ru', attendance: [true, true, true, true, false, false] },
  { id: 9, name: 'Кузнецов Артем', email: 'kuznetsov@sigma.ru', attendance: [false, true, true, false, true, true] },
  { id: 10, name: 'Федорова Софья', email: 'fedorova@sigma.ru', attendance: [true, false, true, true, true, false] },
  { id: 11, name: 'Алексеев Павел', email: 'alekseev@sigma.ru', attendance: [false, false, true, true, false, true] },
  { id: 12, name: 'Николаева Елена', email: 'nikolaeva@sigma.ru', attendance: [true, true, false, false, true, true] },
  { id: 13, name: 'Громов Михаил', email: 'gromov@sigma.ru', attendance: [true, false, true, false, true, false] },
  { id: 14, name: 'Романова Алиса', email: 'romanova@sigma.ru', attendance: [false, true, false, true, true, true] },
  { id: 15, name: 'Ким Даниил', email: 'kim@sigma.ru', attendance: [true, true, true, false, false, true] },
  { id: 16, name: 'Попова Кира', email: 'popova@sigma.ru', attendance: [false, true, true, true, false, false] },
  { id: 17, name: 'Зайцев Максим', email: 'zaytsev@sigma.ru', attendance: [true, false, false, true, true, false] },
  { id: 18, name: 'Беляева Дарья', email: 'belyaeva@sigma.ru', attendance: [true, true, false, true, false, true] },
  { id: 19, name: 'Семенов Илья', email: 'semenov@sigma.ru', attendance: [false, false, true, false, true, true] },
  { id: 20, name: 'Васильева Полина', email: 'vasilyeva@sigma.ru', attendance: [true, true, true, true, true, false] },
  { id: 21, name: 'Макаров Роман', email: 'makarov@sigma.ru', attendance: [true, false, true, true, false, true] },
  { id: 22, name: 'Егорова Милана', email: 'egorova@sigma.ru', attendance: [false, true, false, true, true, false] },
  { id: 23, name: 'Павлов Кирилл', email: 'pavlov@sigma.ru', attendance: [true, true, false, false, true, true] },
  { id: 24, name: 'Тихонова Арина', email: 'tikhonova@sigma.ru', attendance: [false, true, true, true, false, true] },
  { id: 25, name: 'Мельникова Варвара', email: 'melnikova@sigma.ru', attendance: [true, false, true, true, false, true] },
];

const attendanceColumns = ['Дата', 'Дата', 'Дата', 'Дата', 'Дата', 'Дата'];
const pageSize = 10;

export function AttendancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState(initialStudents);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAttendanceSaved, setIsAttendanceSaved] = useState(false);
  const [editableStudentIds, setEditableStudentIds] = useState<number[]>([]);

  const filteredStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return students.slice(startIndex, startIndex + pageSize);
  }, [currentPage, students]);
  const pageCount = Math.ceil(students.length / pageSize);
  const goToPreviousPage = () => setCurrentPage((page) => Math.max(1, page - 1));
  const goToNextPage = () => setCurrentPage((page) => Math.min(pageCount, page + 1));

  const toggleAttendance = (id: number, columnIndex: number) => {
    if (isAttendanceSaved && !editableStudentIds.includes(id)) {
      return;
    }

    setStudents((items) =>
      items.map((student) =>
        student.id === id
          ? {
              ...student,
              attendance: student.attendance.map((checked, index) => (index === columnIndex ? !checked : checked)),
            }
          : student,
      ),
    );
  };

  const clearAttendance = (id: number) => {
    setStudents((items) =>
      items.map((student) =>
        student.id === id
          ? { ...student, attendance: student.attendance.map(() => false) }
          : student,
      ),
    );
  };

  const editAttendance = (id: number) => {
    setEditableStudentIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  };

  const saveAttendance = () => {
    setIsAttendanceSaved(true);
    setEditableStudentIds([]);
  };

  return (
    <main className="attendance-page" aria-label="Посещаемость">
      <TeacherSidebar />

      <aside className="courses-subnav" aria-label="Навигация раздела">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`courses-subnav-item attendance-clickable${location.pathname === item.path ? ' active' : ''}`}
            type="button"
            onClick={() => navigate({ to: item.path })}
            aria-label={item.label}
          >
            <img className="courses-subnav-icon" src={item.icon} alt="" />
            <span>{item.label}</span>
          </button>
        ))}
        <div className="courses-subnav-user">
          <img className="courses-subnav-avatar" src="/teacher/sidebar/avatar.png" alt="" />
          <div className="courses-subnav-user-info">
          <span>Имя фамилия</span>
          <span>teacher@sigma.ru</span>
          </div>
          <img className="courses-subnav-logout" src="/teacher/sidebar/sub_nav_courses/log-out.svg" alt="Выход" />
        </div>
      </aside>

      <section className="attendance-workspace">
        <header className="attendance-header">
          <div>
            <h1>Посещаемость</h1>
            <div className="attendance-course-title-row">
              <p>Название курса</p>
              <span>{students.length} учеников</span>
            </div>
          </div>
        </header>

        <section className="attendance-panel" aria-label="Таблица посещаемости">
          <div className="attendance-table" role="table">
            <div className="attendance-table-header" role="row">
              <span>Ученик</span>
              <span>Почта</span>
              {attendanceColumns.map((column, index) => (
                <span key={`${column}-${index}`}>{column}</span>
              ))}
              <span aria-hidden="true" />
            </div>
            <div className="attendance-table-body">
              {filteredStudents.map((student) => (
                <div className="attendance-row" role="row" key={student.id}>
                  <div className="attendance-student">
                    <img src="/teacher/sidebar/avatar.png" alt="" />
                    <div>
                      <strong>{student.name}</strong>
                    </div>
                  </div>
                  <span className="attendance-email">{student.email}</span>
                  {student.attendance.map((checked, index) => (
                    <label className="attendance-check" key={`${student.id}-${index}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isAttendanceSaved && !editableStudentIds.includes(student.id)}
                        onChange={() => toggleAttendance(student.id, index)}
                      />
                      <span />
                    </label>
                  ))}
                  <div className="attendance-actions">
                    <button className="attendance-icon-button attendance-clickable" type="button" aria-label="Удалить" onClick={() => clearAttendance(student.id)}>
                      <img src="/Bin.svg" alt="" />
                    </button>
                    <button className="attendance-icon-button attendance-clickable" type="button" aria-label="Редактировать" onClick={() => editAttendance(student.id)}>
                      <img src="/Pen.svg" alt="" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="attendance-pagination-row">
          <button className="attendance-pagination-control attendance-clickable" type="button" onClick={goToPreviousPage}>
            Назад
          </button>
          <nav className="attendance-pagination" aria-label="Страницы">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
              <button
                className={`attendance-page-button attendance-clickable${currentPage === page ? ' attendance-page-button--active' : ''}`}
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </nav>
          <button className="attendance-pagination-control attendance-clickable" type="button" onClick={goToNextPage}>
            Вперед
          </button>
        </div>

        <div className="attendance-button-row">
        <button className="attendance-primary-button attendance-clickable" type="button" onClick={saveAttendance}>
          Сохранить посещаемость
        </button>
        </div>
      </section>
    </main>
  );
}
