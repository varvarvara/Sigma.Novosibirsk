import { Suspense, lazy } from "react";
import { loadProfileSettingsContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const ProfileSettingsContent = lazy(loadProfileSettingsContent);

export function ProfileSettingsPage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Настройки профиля" titleVariant="studentTopbar" />}>
            <ProfileSettingsContent />
        </Suspense>
    );
}
