import { Suspense, lazy } from "react";
import { loadCurricularContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CurricularContent = lazy(loadCurricularContent);

export function CurricularPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Учебная активность" />}>
            <CurricularContent />
        </Suspense>
    );
}
