import { Suspense, lazy } from 'react';
import { loadTeacherCoursesCertificatesContent } from '../../../app/lazy-page-loaders';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherCoursesCertificatesContent = lazy(loadTeacherCoursesCertificatesContent);
const fallbackStyle = { width: '100%', padding: 'clamp(24px, 3vw, 48px)', boxSizing: 'border-box' } as const;

export const TeacherCoursesCertificatesPage = () => {
  return (
    <TeacherAppShell className="courses-layout">
      <Suspense fallback={<div style={fallbackStyle}>Загрузка сертификатов...</div>}>
        <TeacherCoursesCertificatesContent />
      </Suspense>
    </TeacherAppShell>
  );
};
