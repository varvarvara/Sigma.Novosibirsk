import { Suspense, lazy } from 'react';
import { loadTeamCreationContent } from '../../../app/lazy-page-loaders';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const TeamCreationContent = lazy(loadTeamCreationContent);
const fallbackStyle = { width: '100%', minWidth: 0, padding: '39px 40px 64px', boxSizing: 'border-box', background: '#ffffff' } as const;

export function TeamCreationPage() {
  return (
    <main className="org-layout team-creation-page" aria-label="Создание команды">
      <OrgSidebar />
      <Suspense fallback={<section className="org-layout__workspace" style={fallbackStyle}>Загрузка формы команды...</section>}>
        <TeamCreationContent />
      </Suspense>
    </main>
  );
}
