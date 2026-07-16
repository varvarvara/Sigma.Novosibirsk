import { Suspense, lazy } from 'react';
import { loadTeacherCoursesApplyContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherCoursesApplyContent = lazy(loadTeacherCoursesApplyContent);

export const TeacherCoursesApplyPage = () => {
  return (
    <TeacherAppShell className="courses-layout">
      <Suspense fallback={<TeacherRouteFallback title="Курсы" label="Новый курс" padding="clamp(24px, 3vw, 48px)" titleVariant="teacherPage" />}>
        <TeacherCoursesApplyContent />
      </Suspense>
    </TeacherAppShell>
  );
};
