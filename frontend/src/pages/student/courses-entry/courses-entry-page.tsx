import { Suspense, lazy } from "react";
import { loadCoursesEntryContent } from "../../../app/lazy-page-loaders";

const CoursesEntryContent = lazy(loadCoursesEntryContent);
const fallbackStyle = {
    width: "min(100%, var(--app-mobile-max-width))",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "24px 20px 96px",
    boxSizing: "border-box",
    background: "#2A2730",
    color: "#F7F6FA",
} as const;

export function CoursesEntryPage() {
    return (
        <Suspense fallback={<main style={fallbackStyle}>Подбираем учебный маршрут...</main>}>
            <CoursesEntryContent />
        </Suspense>
    );
}
