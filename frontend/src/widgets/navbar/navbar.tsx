import { Link, useLocation } from "@tanstack/react-router";
import "./navbar.css";

export function Navbar() {
    const { pathname } = useLocation();
    const coursesIsActive = pathname === "/courses" || pathname === "/soon-update" || pathname === "/course-choice" || pathname === "/course-nothing" || pathname === "/feedback" || pathname === "/my-courses";
    const profileIsActive = pathname === "/" || pathname === "/profile" || pathname === "/extracurricular" || pathname === "/curricular" || pathname === "/curricular-achievements" || pathname === "/curricular-filter";
    const scheduleIsActive = pathname === "/schedule";

    return (
        <nav className="navbar">
            <Link className={`nav-link${coursesIsActive ? " nav-link-active" : ""}`} to="/my-courses">Курсы</Link>
            <Link className={`nav-link${profileIsActive ? " nav-link-active" : ""}`} to="/profile">Профиль</Link>
            <Link className={`nav-link${scheduleIsActive ? " nav-link-active" : ""}`} to="/schedule">Расписание</Link>
        </nav>
    )
}
