import { Suspense, lazy } from "react";
import { loadCourseDetailContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CourseDetailContent = lazy(loadCourseDetailContent);

export function CourseDetailPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Выбор курсов" titleVariant="studentTopbar" />}>
            <CourseDetailContent />
        </Suspense>
    );
}
