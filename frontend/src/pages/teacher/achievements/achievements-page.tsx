import { Suspense, lazy } from 'react';
import { loadTeacherAchievementsContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherAchievementsContent = lazy(loadTeacherAchievementsContent);

export function TeacherAchievementsPage() {
  return (
    <TeacherAppShell>
      <Suspense fallback={<TeacherRouteFallback title="Достижения" padding="48px 40px 48px 32px" />}>
        <TeacherAchievementsContent />
      </Suspense>
    </TeacherAppShell>
  );
}
