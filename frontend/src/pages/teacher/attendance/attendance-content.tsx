import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { AuthApiError } from '../../../entities/auth';
import type {
  TeacherCourseStudentAttendanceDetail,
  TeacherLessonAttendanceItem
} from '../../../entities/teacher/model/attendance.types';
import {
  useBulkMarkAttendanceMutation,
  useTeacherCourseAttendanceDetailsQuery,
  useTeacherCourseAttendanceSummaryQuery,
} from '../../../entities/teacher/queries/attendance.queries';
import { useGetMyTeacherCourses } from '../../../entities/teacher/queries/courses.queries';

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

export default function TeacherAttendanceContent() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [attendanceDraft, setAttendanceDraft] = useState<Record<number, Record<number, boolean>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    data: courses = [],
    isLoading: isCoursesLoading,
    error: coursesError,
  } = useGetMyTeacherCourses();

  useEffect(() => {
    if (!courses.length) {
      return;
    }

    setSelectedCourseId((currentCourseId) => currentCourseId ?? courses[0]?.id ?? null);
  }, [courses]);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useTeacherCourseAttendanceSummaryQuery(selectedCourseId ?? undefined);

  const {
    data: details = [],
    isLoading: isDetailsLoading,
    error: detailsError,
  } = useTeacherCourseAttendanceDetailsQuery(selectedCourseId ?? undefined, summary ?? null);

  const saveAttendanceMutation = useBulkMarkAttendanceMutation(selectedCourseId ?? undefined);
  const isLoading = isCoursesLoading || isSummaryLoading || isDetailsLoading;
  const isSaving = saveAttendanceMutation.isPending;
  const error =
    coursesError instanceof AuthApiError ? coursesError.message :
    summaryError instanceof AuthApiError ? summaryError.message :
    detailsError instanceof AuthApiError ? detailsError.message :
    coursesError || summaryError || detailsError
      ? 'Не удалось загрузить посещаемость'
      : saveError;

  useEffect(() => {
    if (!selectedCourseId) {
      setAttendanceDraft({});
      return;
    }

    setCurrentPage(1);
    setStatusMessage(null);
    setSaveError(null);
  }, [selectedCourseId]);

  useEffect(() => {
    if (!details.length) {
      setAttendanceDraft({});
      return;
    }

    setAttendanceDraft(buildDraft(details));
  }, [details]);

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
      setSaveError(null);
      setStatusMessage(null);

      await saveAttendanceMutation.mutateAsync(
        lessons.map((lesson) => ({
          scheduleId: lesson.schedule_id,
          items: students.map((student) => ({
            student_id: student.student_id,
            attendance_status: attendanceDraft[student.student_id]?.[lesson.schedule_id] ?? false,
          })),
        })),
      );

      setStatusMessage('Посещаемость сохранена. За отмеченное присутствие студентам начислится по 3 балла.');
    } catch (saveError) {
      setSaveError(
        saveError instanceof AuthApiError
          ? saveError.message
          : saveError instanceof Error
            ? saveError.message
            : 'Не удалось сохранить посещаемость',
      );
    }
  };

  return (
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
  );
}
