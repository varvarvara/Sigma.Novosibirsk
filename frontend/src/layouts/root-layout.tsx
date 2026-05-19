import { useLocation } from "@tanstack/react-router";
import { Navbar } from "../widgets/navbar/navbar";
import { PageTransition } from "./page-transition";

const STUDENT_NAVBAR_PATHS = new Set([
    "/profile",
    "/profile-settings",
    "/extracurricular",
    "/curricular",
    "/curricular-achievements",
    "/curricular-filter",
    "/schedule",
    "/courses-entry",
    "/courses",
    "/course-detail",
    "/course-card",
    "/soon-update",
    "/course-choice",
    "/course-nothing",
    "/feedback",
    "/my-courses",
]);

function shouldShowStudentNavbar(pathname: string) {
    return STUDENT_NAVBAR_PATHS.has(pathname);
}

export function RootLayout() {
    const { pathname } = useLocation();

    return (
        <>
            <PageTransition />
            {shouldShowStudentNavbar(pathname) ? <Navbar /> : null}
        </>
    );
}
