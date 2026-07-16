import { Suspense, lazy } from "react";
import { loadCurricularFilterContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CurricularFilterContent = lazy(loadCurricularFilterContent);

export function FilterPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Фильтр" titleVariant="studentTopbar" />}>
            <CurricularFilterContent />
        </Suspense>
    );
}
