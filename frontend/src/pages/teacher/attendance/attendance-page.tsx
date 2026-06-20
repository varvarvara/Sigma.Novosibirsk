import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { getMyTeacherCourses } from '../../../entities/teacher/api/courses.api';
import type { TeacherCourse } from '../../../entities/teacher/model/courses.types';
import {
  bulkMarkAttendance,
  getCourseAttendanceSummary,
  getCourseStudentAttendanceDetail,
  
} from '../../../entities/teacher/api/attendance.api';
import type { 
  TeacherCourseAttendanceSummary,
  TeacherCourseStudentAttendanceDetail,
  TeacherLessonAttendanceItem
} from '../../../entities/teacher/model/attendance.types';
import { TeacherAppShell } from '../../../shared/ui/teacher_sidebar/teacher-app-shell';
import './attendance-page.css';

const pageSize = 10;

function formatStudentName(student: { first_name: string; last_name: string }) {
  return `${student.last_name} ${student.first_name}`.trim();
}

function formatDateHeader(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

function formatLessonTime(value: string) {
  return value.slice(0, 5);
}

function buildDraft(details: TeacherCourseStudentAttendanceDetail[]) {
  return details.reduce<Record<number, Record<number, boolean>>>((acc, detail) => {
    acc[detail.student_id] = detail.lessons.reduce<Record<number, boolean>>((lessonAcc, lesson) => {
      lessonAcc[lesson.schedule_id] = lesson.attendance_status === true;
      return lessonAcc;
    }, {});
    return acc;
  }, {});
}

export function TeacherAttendancePage() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [summary, setSummary] = useState<TeacherCourseAttendanceSummary | null>(null);
  const [details, setDetails] = useState<TeacherCourseStudentAttendanceDetail[]>([]);
  const [attendanceDraft, setAttendanceDraft] = useState<Record<number, Record<number, boolean>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        setIsLoading(true);
        setError(null);
        const teacherCourses = await getMyTeacherCourses();
        if (!isMounted) {
          return;
        }

        setCourses(teacherCourses);
        setSelectedCourseId((currentCourseId) => currentCourseId ?? teacherCourses[0]?.id ?? null);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить курсы преподавателя');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setSummary(null);
      setDetails([]);
      setAttendanceDraft({});
      return;
    }

    let isMounted = true;

    async function loadAttendance() {
      try {
        setIsLoading(true);
        setError(null);
        setStatusMessage(null);
        setCurrentPage(1);

        const courseSummary = await getCourseAttendanceSummary(selectedCourseId as number);
        const studentDetails = await Promise.all(
          courseSummary.students.map((student) =>
            getCourseStudentAttendanceDetail(selectedCourseId as number, student.student_id),
          ),
        );

        if (!isMounted) {
          return;
        }

        setSummary(courseSummary);
        setDetails(studentDetails);
        setAttendanceDraft(buildDraft(studentDetails));
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить посещаемость');
          setSummary(null);
          setDetails([]);
          setAttendanceDraft({});
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAttendance();

    return () => {
      isMounted = false;
    };
  }, [selectedCourseId]);

  const lessons = useMemo<TeacherLessonAttendanceItem[]>(() => details[0]?.lessons ?? [], [details]);
  const students = summary?.students ?? [];
  const pageCount = Math.max(1, Math.ceil(students.length / pageSize));
  const filteredStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return students.slice(startIndex, startIndex + pageSize);
  }, [currentPage, students]);

  const tableStyle = {
    '--attendance-lesson-count': lessons.length,
  } as CSSProperties;

  const goToPreviousPage = () => setCurrentPage((page) => Math.max(1, page - 1));
  const goToNextPage = () => setCurrentPage((page) => Math.min(pageCount, page + 1));

  const toggleAttendance = (studentId: number, scheduleId: number) => {
    setStatusMessage(null);
    setAttendanceDraft((draft) => ({
      ...draft,
      [studentId]: {
        ...(draft[studentId] ?? {}),
        [scheduleId]: !(draft[studentId]?.[scheduleId] ?? false),
      },
    }));
  };

  const saveAttendance = async () => {
    if (!lessons.length || !students.length) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setStatusMessage(null);

      await Promise.all(
        lessons.map((lesson) =>
          bulkMarkAttendance(
            lesson.schedule_id,
            students.map((student) => ({
              student_id: student.student_id,
              attendance_status: attendanceDraft[student.student_id]?.[lesson.schedule_id] ?? false,
            })),
          ),
        ),
      );

      if (selectedCourseId) {
        const courseSummary = await getCourseAttendanceSummary(selectedCourseId);
        const studentDetails = await Promise.all(
          courseSummary.students.map((student) => getCourseStudentAttendanceDetail(selectedCourseId, student.student_id)),
        );
        setSummary(courseSummary);
        setDetails(studentDetails);
        setAttendanceDraft(buildDraft(studentDetails));
      }

      setStatusMessage('Посещаемость сохранена. За отмеченное присутствие студентам начислится по 3 балла.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить посещаемость');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TeacherAppShell>
      <main className="attendance-page" aria-label="Посещаемость">
        <section className="attendance-workspace">
          <header className="attendance-header">
            <div>
              <h1>Посещаемость</h1>
              <div className="attendance-course-title-row">
                <p>{summary?.course_title ?? 'Выберите курс'}</p>
                <span>{students.length} учеников</span>
              </div>
            </div>
            <label className="attendance-course-select">
              <span>Курс</span>
              <select
                value={selectedCourseId ?? ''}
                onChange={(event) => setSelectedCourseId(Number(event.target.value) || null)}
                disabled={isLoading || courses.length === 0}
              >
                {courses.map((course) => (
                  <option value={course.id} key={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
          </header>

          {error && <div className="attendance-alert attendance-alert--error">{error}</div>}
          {statusMessage && <div className="attendance-alert attendance-alert--success">{statusMessage}</div>}

          <section className="attendance-panel" aria-label="Таблица посещаемости">
              <div className="attendance-table" role="table" style={tableStyle}>
              <div className="attendance-table-header" role="row">
                <span>Ученик</span>
                {lessons.map((lesson) => (
                  <span className="attendance-date-head" key={lesson.schedule_id}>
                    <strong>{formatDateHeader(lesson.lesson_date)}</strong>
                    <small>{formatLessonTime(lesson.lesson_time)}</small>
                  </span>
                ))}
              </div>
              <div className="attendance-table-body">
                {isLoading && <div className="attendance-empty">Загружаю данные из базы...</div>}
                {!isLoading && students.length === 0 && <div className="attendance-empty">На этом курсе пока нет назначенных учеников.</div>}
                {!isLoading && students.length > 0 && lessons.length === 0 && (
                  <div className="attendance-empty">У курса пока нет занятий в расписании.</div>
                )}
                {!isLoading &&
                  filteredStudents.map((student) => (
                    <div className="attendance-row" role="row" key={student.student_id}>
                      <div className="attendance-student">
                        <img src="/teacher/sidebar/avatar.png" alt="" />
                        <div>
                          <strong>{formatStudentName(student)}</strong>
                        </div>
                      </div>
                      {lessons.map((lesson) => (
                        <label className="attendance-check" key={`${student.student_id}-${lesson.schedule_id}`}>
                          <input
                            type="checkbox"
                            checked={attendanceDraft[student.student_id]?.[lesson.schedule_id] ?? false}
                            onChange={() => toggleAttendance(student.student_id, lesson.schedule_id)}
                          />
                          <span />
                        </label>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </section>

          <div className="attendance-pagination-row">
            <button className="attendance-pagination-control attendance-clickable" type="button" onClick={goToPreviousPage} disabled={currentPage === 1}>
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
            <button className="attendance-pagination-control attendance-clickable" type="button" onClick={goToNextPage} disabled={currentPage === pageCount}>
              Вперед
            </button>
          </div>

          <div className="attendance-button-row">
            <button
              className="attendance-primary-button attendance-clickable"
              type="button"
              onClick={saveAttendance}
              disabled={isSaving || isLoading || students.length === 0 || lessons.length === 0}
            >
              {isSaving ? 'Сохраняю...' : 'Сохранить посещаемость'}
            </button>
          </div>
        </section>
      </main>
    </TeacherAppShell>
  );
}
