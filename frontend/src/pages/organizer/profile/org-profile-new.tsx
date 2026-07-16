import { Suspense, lazy } from 'react';
import { loadOrgProfileContent } from '../../../app/lazy-page-loaders';
import { OrganizerRouteFallback } from '../../../shared/ui/route-fallbacks';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const OrgProfileContent = lazy(loadOrgProfileContent);

export const OrgProfileNewPage = () => {
  return (
    <div className="org-layout org-profile-container">
      <OrgSidebar />
      <Suspense fallback={<OrganizerRouteFallback title="Профиль организатора" titleVariant="organizerPage" />}>
        <OrgProfileContent />
      </Suspense>
    </div>
  );
};
