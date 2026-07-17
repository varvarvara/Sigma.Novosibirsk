import { Suspense, lazy } from "react";
import { loadScheduleContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const ScheduleContent = lazy(loadScheduleContent);

export function SchedulePage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Расписание" titleVariant="studentLarge" />}>
            <ScheduleContent />
        </Suspense>
    );
}
