import { Suspense, lazy } from 'react';
import { loadOrgProfileContent } from '../../../app/lazy-page-loaders';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const OrgProfileContent = lazy(loadOrgProfileContent);
const fallbackStyle = { flex: 1, minWidth: 0, background: '#ffffff', boxSizing: 'border-box' } as const;

export const OrgProfileNewPage = () => {
  return (
    <div className="org-layout org-profile-container">
      <OrgSidebar />
      <Suspense fallback={<main className="org-layout__workspace" style={fallbackStyle}>Загрузка профиля...</main>}>
        <OrgProfileContent />
      </Suspense>
    </div>
  );
};
