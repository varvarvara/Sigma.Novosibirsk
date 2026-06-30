import { Suspense, lazy } from "react";
import { loadCoursesEntryContent } from "../../../app/lazy-page-loaders";

const CoursesEntryContent = lazy(loadCoursesEntryContent);

export function CoursesEntryPage() {
    return (
        <Suspense fallback={null}>
            <CoursesEntryContent />
        </Suspense>
    );
}
