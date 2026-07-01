import { Suspense, lazy } from 'react';
import { loadExtracurricularPointsAddContent } from '../../../app/lazy-page-loaders';
import { OrganizerRouteFallback } from '../../../shared/ui/route-fallbacks';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const ExtracurricularPointsAddContent = lazy(loadExtracurricularPointsAddContent);

export function ExtracurricularPointsAddPage() {
  return (
    <main className="org-layout points-add-page" aria-label="Начисление баллов">
      <OrgSidebar />
      <Suspense fallback={<OrganizerRouteFallback title="Начисление баллов" />}>
        <ExtracurricularPointsAddContent />
      </Suspense>
    </main>
  );
}
