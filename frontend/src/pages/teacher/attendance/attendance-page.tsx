import { Suspense, lazy } from 'react';
import { loadTeacherAttendanceContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherAttendanceContent = lazy(loadTeacherAttendanceContent);

export function TeacherAttendancePage() {
  return (
    <TeacherAppShell>
      <Suspense fallback={<TeacherRouteFallback title="Посещаемость" padding="48px 40px 48px 32px" />}>
        <TeacherAttendanceContent />
      </Suspense>
    </TeacherAppShell>
  );
}
