import { Suspense, lazy } from "react";
import { loadCurricularAchievementsContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CurricularAchievementsContent = lazy(loadCurricularAchievementsContent);

export function CurricularAchievementsPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Достижения" />}>
            <CurricularAchievementsContent />
        </Suspense>
    );
}
