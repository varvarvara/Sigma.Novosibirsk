import { Suspense, lazy } from 'react';
import { loadTeamCreationContent } from '../../../app/lazy-page-loaders';
import { OrganizerRouteFallback } from '../../../shared/ui/route-fallbacks';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const TeamCreationContent = lazy(loadTeamCreationContent);

export function TeamCreationPage() {
  return (
    <main className="org-layout team-creation-page" aria-label="Создание команды">
      <OrgSidebar />
      <Suspense fallback={<OrganizerRouteFallback title="Создание команды" padding="39px 40px 64px" titleVariant="organizerPage" />}>
        <TeamCreationContent />
      </Suspense>
    </main>
  );
}
