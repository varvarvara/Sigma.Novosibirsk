import { Suspense, lazy } from "react";
import { loadCourseChoiceContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const CourseChoiceContent = lazy(loadCourseChoiceContent);

export function CourseChoicePage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Курсы" titleVariant="studentLarge" />}>
            <CourseChoiceContent />
        </Suspense>
    );
}
