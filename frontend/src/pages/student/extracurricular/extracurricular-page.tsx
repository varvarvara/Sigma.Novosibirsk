import { Suspense, lazy } from "react";
import { loadExtracurricularContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const ExtracurricularContent = lazy(loadExtracurricularContent);

export function ExtracurricularPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Внеучебка // Внеучебная активность" titleVariant="studentTopbar" />}>
            <ExtracurricularContent />
        </Suspense>
    );
}
