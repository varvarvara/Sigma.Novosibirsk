import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { getMyTeacherCourses } from '../../../entities/teacher/api/courses.api';
import type { TeacherCourse } from '../../../entities/teacher/model/courses.types';
import {
  assignAchievement,
  getCourseAchievementMatrix,
} from '../../../entities/teacher/api/attendance.api';
import type { TeacherAchievementMatrix } from '../../../entities/teacher/model/attendance.types';
import { TeacherAppShell } from '../../../shared/ui/teacher_sidebar/teacher-app-shell';
import './achievements-page.css';

const pageSize = 10;

function formatStudentName(student: { first_name: string; last_name: string }) {
  return `${student.last_name} ${student.first_name}`.trim();
}

function buildAchievementDraft(matrix: TeacherAchievementMatrix) {
  return matrix.students.reduce<Record<number, Record<number, boolean>>>((acc, student) => {
    acc[student.student_id] = student.achievements.reduce<Record<number, boolean>>((achievementAcc, achievement) => {
      achievementAcc[achievement.achievement_id] = achievement.assigned;
      return achievementAcc;
    }, {});
    return acc;
  }, {});
}

export function TeacherAchievementsPage() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [matrix, setMatrix] = useState<TeacherAchievementMatrix | null>(null);
  const [achievementDraft, setAchievementDraft] = useState<Record<number, Record<number, boolean>>>({});
  const [initialAchievementDraft, setInitialAchievementDraft] = useState<Record<number, Record<number, boolean>>>({});
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
      setMatrix(null);
      setAchievementDraft({});
      setInitialAchievementDraft({});
      return;
    }

    let isMounted = true;

    async function loadAchievements() {
      try {
        setIsLoading(true);
        setError(null);
        setStatusMessage(null);
        setCurrentPage(1);

        const courseMatrix = await getCourseAchievementMatrix(selectedCourseId as number);
        const draft = buildAchievementDraft(courseMatrix);

        if (!isMounted) {
          return;
        }

        setMatrix(courseMatrix);
        setAchievementDraft(draft);
        setInitialAchievementDraft(draft);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить ачивки');
          setMatrix(null);
          setAchievementDraft({});
          setInitialAchievementDraft({});
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAchievements();

    return () => {
      isMounted = false;
    };
  }, [selectedCourseId]);

  const students = matrix?.students ?? [];
  const achievements = matrix?.achievements ?? [];
  const pageCount = Math.max(1, Math.ceil(students.length / pageSize));
  const filteredStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return students.slice(startIndex, startIndex + pageSize);
  }, [currentPage, students]);

  const tableStyle = {
    '--achievement-count': achievements.length,
  } as CSSProperties;

  const goToPreviousPage = () => setCurrentPage((page) => Math.max(1, page - 1));
  const goToNextPage = () => setCurrentPage((page) => Math.min(pageCount, page + 1));

  const toggleAchievement = (studentId: number, achievementId: number) => {
    if (initialAchievementDraft[studentId]?.[achievementId]) {
      return;
    }

    setStatusMessage(null);
    setAchievementDraft((draft) => ({
      ...draft,
      [studentId]: {
        ...(draft[studentId] ?? {}),
        [achievementId]: !(draft[studentId]?.[achievementId] ?? false),
      },
    }));
  };

  const saveAchievement = async () => {
    if (!matrix || !achievements.length || !students.length) {
      return;
    }

    const assignmentsToCreate = students.flatMap((student) =>
      achievements
        .filter((achievement) => {
          const wasAssigned = initialAchievementDraft[student.student_id]?.[achievement.id] ?? false;
          const shouldBeAssigned = achievementDraft[student.student_id]?.[achievement.id] ?? false;
          return shouldBeAssigned && !wasAssigned;
        })
        .map((achievement) => ({ studentId: student.student_id, achievementId: achievement.id })),
    );

    if (assignmentsToCreate.length === 0) {
      setStatusMessage('Новых ачивок для сохранения нет. Уже выданные ачивки отмечены в таблице.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setStatusMessage(null);

      await Promise.all(
        assignmentsToCreate.map((assignment) => assignAchievement(assignment.studentId, assignment.achievementId)),
      );

      if (selectedCourseId) {
        const updatedMatrix = await getCourseAchievementMatrix(selectedCourseId);
        const updatedDraft = buildAchievementDraft(updatedMatrix);
        setMatrix(updatedMatrix);
        setAchievementDraft(updatedDraft);
        setInitialAchievementDraft(updatedDraft);
      }

      setStatusMessage('Ачивки сохранены. За каждую ачивку студент получает 1 балл.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Не удалось сохранить ачивки');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TeacherAppShell>
      <main className="achievement-page" aria-label="Ачивки">
        <section className="achievement-workspace">
          <header className="achievement-header">
            <div>
              <h1>Ачивки</h1>
              <div className="achievement-course-title-row">
                <p>{matrix?.course_title ?? 'Выберите курс'}</p>
                <span>{students.length} учеников</span>
              </div>
            </div>
            <label className="achievement-course-select">
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

          {error && <div className="achievement-alert achievement-alert--error">{error}</div>}
          {statusMessage && <div className="achievement-alert achievement-alert--success">{statusMessage}</div>}

          <section className="achievement-panel" aria-label="Таблица ачивок">
              <div className="achievement-table" role="table" style={tableStyle}>
              <div className="achievement-table-header" role="row">
                <span>Ученик</span>
                {achievements.map((achievement) => (
                  <span className="achievement-name-head" key={achievement.id} title={achievement.achievement_name}>
                    {achievement.achievement_name}
                  </span>
                ))}
              </div>
              <div className="achievement-table-body">
                {isLoading && <div className="achievement-empty">Загружаю данные из базы...</div>}
                {!isLoading && students.length === 0 && <div className="achievement-empty">На этом курсе пока нет назначенных учеников.</div>}
                {!isLoading && students.length > 0 && achievements.length === 0 && (
                  <div className="achievement-empty">У курса пока нет ачивок.</div>
                )}
                {!isLoading &&
                  filteredStudents.map((student) => (
                    <div className="achievement-row" role="row" key={student.student_id}>
                      <div className="achievement-student">
                        <img src="/teacher/sidebar/avatar.png" alt="" />
                        <div>
                          <strong>{formatStudentName(student)}</strong>
                        </div>
                      </div>
                      {achievements.map((achievement) => {
                        const assigned = initialAchievementDraft[student.student_id]?.[achievement.id] ?? false;
                        return (
                          <label className="achievement-check" key={`${student.student_id}-${achievement.id}`}>
                            <input
                              type="checkbox"
                              checked={achievementDraft[student.student_id]?.[achievement.id] ?? false}
                              disabled={assigned}
                              onChange={() => toggleAchievement(student.student_id, achievement.id)}
                            />
                            <span title={assigned ? 'Ачивка уже выдана' : achievement.achievement_name} />
                          </label>
                        );
                      })}
                    </div>
                  ))}
              </div>
            </div>
          </section>

          <div className="achievement-pagination-row">
            <button className="achievement-pagination-control achievement-clickable" type="button" onClick={goToPreviousPage} disabled={currentPage === 1}>
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
            <button className="achievement-pagination-control achievement-clickable" type="button" onClick={goToNextPage} disabled={currentPage === pageCount}>
              Вперед
            </button>
          </div>

          <div className="achievement-button-row">
            <button
              className="achievement-primary-button achievement-clickable"
              type="button"
              onClick={saveAchievement}
              disabled={isSaving || isLoading || students.length === 0 || achievements.length === 0}
            >
              {isSaving ? 'Сохраняю...' : 'Сохранить ачивки'}
            </button>
          </div>
        </section>
      </main>
    </TeacherAppShell>
  );
}
