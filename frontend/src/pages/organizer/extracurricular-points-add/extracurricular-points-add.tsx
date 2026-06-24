import { Suspense, lazy } from 'react';
import { loadExtracurricularPointsAddContent } from '../../../app/lazy-page-loaders';
import { OrgSidebar } from '../../../widgets/org-sidebar';

const ExtracurricularPointsAddContent = lazy(loadExtracurricularPointsAddContent);
const fallbackStyle = { width: '100%', minWidth: 0, padding: '32px 40px 40px', boxSizing: 'border-box', background: '#ffffff' } as const;

export function ExtracurricularPointsAddPage() {
  return (
    <main className="org-layout points-add-page" aria-label="Начисление баллов">
      <OrgSidebar />
      <Suspense fallback={<section className="org-layout__workspace" style={fallbackStyle}>Загрузка посещаемости...</section>}>
        <ExtracurricularPointsAddContent />
      </Suspense>
    </main>
  );
}
