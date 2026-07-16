import { Suspense, lazy } from 'react';
import { loadTeacherCourseEditContent } from '../../../app/lazy-page-loaders';
import { TeacherRouteFallback } from '../../../shared/ui/route-fallbacks';

const TeacherCourseEditContent = lazy(loadTeacherCourseEditContent);

export function TeacherCourseEditPage() {
  return (
    <Suspense fallback={<TeacherRouteFallback title="Редактирование курса" padding="40px 24px" maxWidth="1000px" titleVariant="teacherPage" />}>
      <TeacherCourseEditContent />
    </Suspense>
  );
}
