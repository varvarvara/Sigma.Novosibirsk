import { Suspense, lazy } from 'react';
import { loadTeacherScheduleContent } from '../../../app/lazy-page-loaders';
import { TeacherAppShell } from '../../../widgets/teacher-sidebar/teacher-app-shell';
const TeacherScheduleContent = lazy(loadTeacherScheduleContent);
const fallbackStyle = { width: '100%', padding: '32px 40px', boxSizing: 'border-box' } as const;

export function TeacherSchedulePage() {
  return (
    <TeacherAppShell className="teacher-schedule-layout">
      <Suspense fallback={<div style={fallbackStyle}>Загрузка расписания...</div>}>
        <TeacherScheduleContent />
      </Suspense>
    </TeacherAppShell>
  );
}
