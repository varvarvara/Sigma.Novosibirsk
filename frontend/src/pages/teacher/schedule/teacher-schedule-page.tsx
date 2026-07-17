import { Suspense, lazy } from 'react';
import { loadTeacherScheduleContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherScheduleContent = lazy(loadTeacherScheduleContent);

export function TeacherSchedulePage() {
  return (
    <TeacherAppShell className="teacher-schedule-layout">
      <Suspense fallback={<TeacherRouteFallback title="Расписание" padding="32px 40px" titleVariant="teacherPage" />}>
        <TeacherScheduleContent />
      </Suspense>
    </TeacherAppShell>
  );
}
