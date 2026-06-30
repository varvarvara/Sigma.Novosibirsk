import { Suspense, lazy } from "react";
import { loadExtracurricularContent } from "../../../app/lazy-page-loaders";

const ExtracurricularContent = lazy(loadExtracurricularContent);
const fallbackStyle = {
    width: "min(100%, 360px)",
    minHeight: "100vh",
    margin: "0 auto",
    padding: "24px 20px 96px",
    boxSizing: "border-box",
    background: "#2A2730",
    color: "#F7F6FA",
} as const;

export function ExtracurricularPage() {
    return (
        <Suspense fallback={<main style={fallbackStyle}>Загрузка внеучебки...</main>}>
            <ExtracurricularContent />
        </Suspense>
    );
}
