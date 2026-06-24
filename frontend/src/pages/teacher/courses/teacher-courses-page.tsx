import { Suspense, lazy } from 'react';
import { loadTeacherCoursesContent } from '../../../app/lazy-page-loaders';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherCoursesContent = lazy(loadTeacherCoursesContent);
const fallbackStyle = { width: '100%', padding: 'clamp(24px, 3vw, 48px)', boxSizing: 'border-box' } as const;

export function TeacherCoursesPage() {
  return (
    <TeacherAppShell className="courses-layout">
      <Suspense fallback={<div style={fallbackStyle}>Загрузка курсов...</div>}>
        <TeacherCoursesContent />
      </Suspense>
    </TeacherAppShell>
  );
}
