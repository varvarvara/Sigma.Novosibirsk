import { Suspense, lazy } from 'react';
import { loadTeacherCoursesCertificatesContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherCoursesCertificatesContent = lazy(loadTeacherCoursesCertificatesContent);

export const TeacherCoursesCertificatesPage = () => {
  return (
    <TeacherAppShell className="courses-layout">
      <Suspense fallback={<TeacherRouteFallback title="Сертификаты" padding="clamp(24px, 3vw, 48px)" titleVariant="teacherPage" />}>
        <TeacherCoursesCertificatesContent />
      </Suspense>
    </TeacherAppShell>
  );
};
