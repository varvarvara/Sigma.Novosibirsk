import { Suspense, lazy } from 'react';
import { loadOrgExtracurricularCreationContent } from '../../../app/lazy-page-loaders';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const OrgExtracurricularCreationContent = lazy(loadOrgExtracurricularCreationContent);
const fallbackStyle = { width: '100%', minWidth: 0, padding: '32px 40px 40px', boxSizing: 'border-box', background: '#ffffff' } as const;

export function OrgExtracurricularCreationPage() {
  return (
    <main className="org-layout org-extra-page" aria-label="Создание активности">
      <OrgSidebar />
      <Suspense fallback={<section className="org-layout__workspace" style={fallbackStyle}>Загрузка формы активности...</section>}>
        <OrgExtracurricularCreationContent />
      </Suspense>
    </main>
  );
}
