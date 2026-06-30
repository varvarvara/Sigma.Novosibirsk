import { Suspense, lazy } from "react";
import { loadScheduleContent } from "../../../app/lazy-page-loaders";

const ScheduleContent = lazy(loadScheduleContent);
const fallbackStyle = {
    width: "min(100%, 360px)",
    minHeight: "100dvh",
    margin: "0 auto",
    padding: "24px 20px 96px",
    boxSizing: "border-box",
    background: "#2A2730",
    color: "#F7F6FA",
} as const;

export function SchedulePage() {
    return (
        <Suspense fallback={<main style={fallbackStyle}>Загрузка расписания...</main>}>
            <ScheduleContent />
        </Suspense>
    );
}
