import { Suspense, lazy } from "react";
import { loadMyCoursesContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const MyCoursesContent = lazy(loadMyCoursesContent);

export function MyCoursesPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Мои курсы" />}>
            <MyCoursesContent />
        </Suspense>
    );
}
