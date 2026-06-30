import { Suspense, lazy } from "react";
import { loadProfileSettingsContent } from "../../../app/lazy-page-loaders";

const ProfileSettingsContent = lazy(loadProfileSettingsContent);
const fallbackStyle = {
    width: "min(100%, 360px)",
    minHeight: "100dvh",
    margin: "0 auto",
    padding: "24px 20px 96px",
    boxSizing: "border-box",
    background: "#2A2730",
    color: "#F7F6FA",
} as const;

export function ProfileSettingsPage() {
    return (
        <Suspense fallback={<main style={fallbackStyle}>Загрузка настроек...</main>}>
            <ProfileSettingsContent />
        </Suspense>
    );
}
