import { Suspense, lazy } from 'react';
import { loadTeacherAttendanceContent } from '../../../app/lazy-page-loaders';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherAttendanceContent = lazy(loadTeacherAttendanceContent);
const fallbackStyle = { width: '100%', padding: '48px 40px 48px 32px', boxSizing: 'border-box' } as const;

export function TeacherAttendancePage() {
  return (
    <TeacherAppShell>
      <Suspense fallback={<div style={fallbackStyle}>Загрузка посещаемости...</div>}>
        <TeacherAttendanceContent />
      </Suspense>
    </TeacherAppShell>
  );
}
