import { Suspense, lazy } from 'react';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
import './teacher-courses-styles.css';

//Регистрация ЗАКРЫТА
const IS_REGISTRATION_OPEN = false;

// Основной компонент
const TeacherCoursesApplyContent = lazy(() => import('./teacher-courses-apply-content'));

// Компонент-заглушка (отображается, когда регистрация ЗАКРЫТА)
function TeacherCoursesApplyClosed() {
  return (
    <TeacherAppShell className="courses-layout">
      <div className="courses-content">
        <div className="courses-content-inner">
          <h1 className="courses-title">Подача заявок на курсы</h1>
          <p style={{ fontSize: '18px', color: '#475467', marginTop: '12px' }}>
            Регистрация курсов завершена. Следите за обновлениями в следующем сезоне.
          </p>
        </div>
      </div>
    </TeacherAppShell>
  );
}

export const TeacherCoursesApplyPage = () => {
  // Если регистрация ОТКРЫТА — показываем форму, иначе — ЗАГЛУШКА
  if (!IS_REGISTRATION_OPEN) {
    return <TeacherCoursesApplyClosed />;
  }

  return (
    <TeacherAppShell className="courses-layout">
      <Suspense fallback={<div>Загрузка...</div>}>
        <TeacherCoursesApplyContent />
      </Suspense>
    </TeacherAppShell>
  );
};