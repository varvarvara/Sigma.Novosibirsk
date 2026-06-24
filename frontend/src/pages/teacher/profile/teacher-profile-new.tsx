import { Suspense, lazy } from 'react';
import { loadTeacherProfileContent } from '../../../app/lazy-page-loaders';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherProfileContent = lazy(loadTeacherProfileContent);
const fallbackStyle = { width: '100%', padding: '32px 60px 48px', boxSizing: 'border-box' } as const;

export const TeacherProfileNewPage = () => {
  return (
    <TeacherAppShell className="teacher-profile-container">
      <Suspense fallback={<div style={fallbackStyle}>Загрузка профиля...</div>}>
        <TeacherProfileContent />
      </Suspense>
    </TeacherAppShell>
  );
};
