import { Suspense, lazy } from "react";
import { loadCourseCardContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CourseCardContent = lazy(loadCourseCardContent);

export function CourseCardPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Выбор курсов" label="Карточка курса" titleVariant="studentTopbar" />}>
            <CourseCardContent />
        </Suspense>
    );
}
