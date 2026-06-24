import { Suspense, lazy } from 'react';
import { loadOrgExtracurricularContent } from '../../../app/lazy-page-loaders';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const OrgExtracurricularContent = lazy(loadOrgExtracurricularContent);
const fallbackStyle = { width: '100%', minWidth: 0, padding: '32px 40px 40px', boxSizing: 'border-box', background: '#ffffff' } as const;

export function OrgExtracurricularManagementPage() {
  return (
    <main className="org-layout org-extracurricular-page" aria-label="Внеучебка">
      <OrgSidebar />
      <Suspense fallback={<section className="org-layout__workspace" style={fallbackStyle}>Загрузка мероприятий...</section>}>
        <OrgExtracurricularContent />
      </Suspense>
    </main>
  );
}
