import { Suspense, lazy } from 'react';
import { loadOrgExtracurricularCreationContent } from '../../../app/lazy-page-loaders';
import { OrganizerRouteFallback } from '../../../shared/ui/route-fallbacks';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const OrgExtracurricularCreationContent = lazy(loadOrgExtracurricularCreationContent);

export function OrgExtracurricularCreationPage() {
  return (
    <main className="org-layout org-extra-page" aria-label="Создание активности">
      <OrgSidebar />
      <Suspense fallback={<OrganizerRouteFallback title="Создание активности" titleVariant="organizerPage" />}>
        <OrgExtracurricularCreationContent />
      </Suspense>
    </main>
  );
}
