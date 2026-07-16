import { Suspense, lazy } from 'react';
import { loadOrgExtracurricularContent } from '../../../app/lazy-page-loaders';
import { OrganizerRouteFallback } from '../../../shared/ui/route-fallbacks';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const OrgExtracurricularContent = lazy(loadOrgExtracurricularContent);

export function OrgExtracurricularManagementPage() {
  return (
    <main className="org-layout org-extracurricular-page" aria-label="Внеучебка">
      <OrgSidebar />
      <Suspense fallback={<OrganizerRouteFallback title="Внеучебная деятельность" titleVariant="organizerPage" />}>
        <OrgExtracurricularContent />
      </Suspense>
    </main>
  );
}
