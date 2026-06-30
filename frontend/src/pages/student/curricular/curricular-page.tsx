import { Suspense, lazy } from "react";
import { loadCurricularContent } from "../../../app/lazy-page-loaders";

const CurricularContent = lazy(loadCurricularContent);
const fallbackStyle = {
    width: "min(100%, 360px)",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "24px 20px 96px",
    boxSizing: "border-box",
    background: "#2A2730",
    color: "#F7F6FA",
} as const;

export function CurricularPage() {
    return (
        <Suspense fallback={<main style={fallbackStyle}>Загрузка учебной активности...</main>}>
            <CurricularContent />
        </Suspense>
    );
}
