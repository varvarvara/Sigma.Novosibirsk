import { Suspense, lazy } from 'react';
import { loadTeacherProfileContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherProfileContent = lazy(loadTeacherProfileContent);

export const TeacherProfileNewPage = () => {
  return (
    <TeacherAppShell className="teacher-profile-container">
      <Suspense fallback={<TeacherRouteFallback title="Профиль преподавателя" padding="32px 60px 48px" titleVariant="teacherPage" />}>
        <TeacherProfileContent />
      </Suspense>
    </TeacherAppShell>
  );
};
