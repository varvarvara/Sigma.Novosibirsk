import { Suspense, lazy } from 'react';
import { loadTeacherAchievementsContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
import './achievements-page.css';
const TeacherAchievementsContent = lazy(loadTeacherAchievementsContent);

export function TeacherAchievementsPage() {
  return (
    <TeacherAppShell className="achievement-layout">
      <Suspense fallback={<TeacherRouteFallback title="Ачивки" padding="48px 40px 48px 32px" titleVariant="teacherPage" />}>
        <TeacherAchievementsContent />
      </Suspense>
    </TeacherAppShell>
  );
}
