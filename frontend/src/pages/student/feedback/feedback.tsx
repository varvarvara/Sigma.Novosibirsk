import { Suspense, lazy } from "react";
import { loadFeedbackContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const FeedbackContent = lazy(loadFeedbackContent);

export function FeedbackPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Мои курсы" label="Фидбэк" titleVariant="studentTopbar" />}>
            <FeedbackContent />
        </Suspense>
    );
}
