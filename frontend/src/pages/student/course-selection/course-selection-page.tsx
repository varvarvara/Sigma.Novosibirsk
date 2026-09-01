import { Suspense, lazy } from "react";
import { loadCourseSelectionContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CourseSelectionContent = lazy(loadCourseSelectionContent);

export function CourseSelectionPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Выбор курсов" titleVariant="studentTopbar" />}>
            <CourseSelectionContent />
        </Suspense>
    );
}
