import { Suspense, lazy } from "react";
import { loadProfileContent } from "../../../app/lazy-page-loaders";
import { StudentRouteFallback } from "../../../shared/ui/route-fallbacks";

const ProfileContent = lazy(loadProfileContent);

export function ProfilePage() {
    return (
        <Suspense fallback={<StudentRouteFallback title="Профиль" />}>
            <ProfileContent />
        </Suspense>
    );
}
