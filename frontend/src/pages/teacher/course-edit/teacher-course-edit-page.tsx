import { Suspense, lazy } from 'react';
import { loadTeacherCourseEditContent } from '../../../app/lazy-page-loaders';

const TeacherCourseEditContent = lazy(loadTeacherCourseEditContent);
const fallbackStyle = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '40px 24px',
  boxSizing: 'border-box',
} as const;

export function TeacherCourseEditPage() {
  return (
    <Suspense fallback={<div style={fallbackStyle}>Загрузка редактирования курса...</div>}>
      <TeacherCourseEditContent />
    </Suspense>
  );
}
