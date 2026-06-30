import { Suspense, lazy } from 'react';
import { loadSetupTeacherNewContent } from '../../../app/lazy-page-loaders';

const SetupTeacherNewPageContent = lazy(loadSetupTeacherNewContent);
const fallbackStyle = { minHeight: '100vh', padding: '32px 20px', boxSizing: 'border-box' } as const;

export function SetupTeacherNewPage() {
  return (
    <Suspense fallback={<main style={fallbackStyle}>Загрузка регистрации преподавателя...</main>}>
      <SetupTeacherNewPageContent />
    </Suspense>
  );
}
