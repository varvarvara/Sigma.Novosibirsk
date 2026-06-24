import { Suspense, lazy } from 'react';
import { loadTeamFormationContent } from '../../../app/lazy-page-loaders';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const TeamFormationContent = lazy(loadTeamFormationContent);
const fallbackStyle = { width: '100%', minWidth: 0, padding: '32px 40px 40px', boxSizing: 'border-box', background: '#ffffff' } as const;

export function TeamFormationPage() {
  return (
    <main className="org-layout team-formation-page" aria-label="Команды внеучебки">
      <OrgSidebar />
      <Suspense fallback={<section className="org-layout__workspace" style={fallbackStyle}>Загрузка команд...</section>}>
        <TeamFormationContent />
      </Suspense>
    </main>
  );
}
