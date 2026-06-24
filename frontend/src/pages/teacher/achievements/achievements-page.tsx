import { Suspense, lazy } from 'react';
import { loadTeacherAchievementsContent } from '../../../app/lazy-page-loaders';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherAchievementsContent = lazy(loadTeacherAchievementsContent);
const fallbackStyle = { width: '100%', padding: '48px 40px 48px 32px', boxSizing: 'border-box' } as const;

export function TeacherAchievementsPage() {
  return (
    <TeacherAppShell>
      <Suspense fallback={<div style={fallbackStyle}>Загрузка ачивок...</div>}>
        <TeacherAchievementsContent />
      </Suspense>
    </TeacherAppShell>
  );
}
