import { Suspense, lazy } from "react";
import { loadCourseCardContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CourseCardContent = lazy(loadCourseCardContent);

export function CourseCardPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Карточка курса" />}>
            <CourseCardContent />
        </Suspense>
    );
}
