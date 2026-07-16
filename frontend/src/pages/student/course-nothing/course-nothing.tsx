import { Suspense, lazy } from "react";
import { loadCourseNothingContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CourseNothingContent = lazy(loadCourseNothingContent);

export function CourseNothingPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Курсы" titleVariant="studentLarge" />}>
            <CourseNothingContent />
        </Suspense>
    );
}
