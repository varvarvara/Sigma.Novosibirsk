import { Suspense, lazy } from 'react';
import { loadTeamFormationContent } from '../../../app/lazy-page-loaders';
import { OrganizerRouteFallback } from '../../../shared/ui/route-fallbacks';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const TeamFormationContent = lazy(loadTeamFormationContent);

export function TeamFormationPage() {
  return (
    <main className="org-layout team-formation-page" aria-label="Команды внеучебки">
      <OrgSidebar />
      <Suspense fallback={<OrganizerRouteFallback title="Команды" titleVariant="organizerPage" />}>
        <TeamFormationContent />
      </Suspense>
    </main>
  );
}
