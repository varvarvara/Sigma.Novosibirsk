import { Suspense, lazy } from 'react';
import { loadTeacherCoursesContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherCoursesContent = lazy(loadTeacherCoursesContent);

export function TeacherCoursesPage() {
  return (
    <TeacherAppShell className="courses-layout">
      <Suspense fallback={<TeacherRouteFallback title="Курсы" padding="clamp(24px, 3vw, 48px)" />}>
        <TeacherCoursesContent />
      </Suspense>
    </TeacherAppShell>
  );
}
