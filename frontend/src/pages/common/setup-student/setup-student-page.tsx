import { Suspense, lazy } from 'react';
import { loadSetupStudentPageContent } from '../../../app/lazy-page-loaders';

const SetupStudentPageContent = lazy(loadSetupStudentPageContent);
const fallbackStyle = { minHeight: '100vh', padding: '32px 20px', boxSizing: 'border-box' } as const;

export function SetupStudentPage() {
  return (
    <Suspense fallback={<main style={fallbackStyle}>Загрузка регистрации ученика...</main>}>
      <SetupStudentPageContent />
    </Suspense>
  );
}
