import { Suspense, lazy } from 'react';
import { loadTeacherAttendanceContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
import './attendance-page.css';
const TeacherAttendanceContent = lazy(loadTeacherAttendanceContent);

export function TeacherAttendancePage() {
  return (
    <TeacherAppShell className="attendance-layout">
      <Suspense fallback={<TeacherRouteFallback title="Посещаемость" padding="48px 40px 48px 32px" titleVariant="teacherPage" />}>
        <TeacherAttendanceContent />
      </Suspense>
    </TeacherAppShell>
  );
}
