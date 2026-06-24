import { Suspense, lazy } from 'react';
import { loadTeacherCoursesApplyContent } from '../../../app/lazy-page-loaders';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherCoursesApplyContent = lazy(loadTeacherCoursesApplyContent);
const fallbackStyle = { width: '100%', padding: 'clamp(24px, 3vw, 48px)', boxSizing: 'border-box' } as const;

export const TeacherCoursesApplyPage = () => {
  return (
    <TeacherAppShell className="courses-layout">
      <Suspense fallback={<div style={fallbackStyle}>Загрузка формы курса...</div>}>
        <TeacherCoursesApplyContent />
      </Suspense>
    </TeacherAppShell>
  );
};
