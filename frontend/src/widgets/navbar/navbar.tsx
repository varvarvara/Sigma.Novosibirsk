import { Link, useLocation } from "@tanstack/react-router";
import "./navbar.css";

export function Navbar() {
    const { pathname } = useLocation();

    const coursesIsActive =
        pathname === "/courses-entry" ||
        pathname === "/courses" ||
        pathname === "/course-detail" ||
        pathname === "/course-card" ||
        pathname === "/soon-update" ||
        pathname === "/course-choice" ||
        pathname === "/course-nothing" ||
        pathname === "/feedback" ||
        pathname === "/my-courses";
    const profileIsActive =
        pathname === "/" ||
        pathname === "/profile" ||
        pathname === "/extracurricular" ||
        pathname === "/curricular" ||
        pathname === "/curricular-achievements" ||
        pathname === "/curricular-filter";
    const scheduleIsActive = pathname === "/schedule";

    const tabs = [
        { to: "/courses-entry", label: "Курсы", isActive: coursesIsActive },
        { to: "/profile", label: "Профиль", isActive: profileIsActive },
        { to: "/schedule", label: "Расписание", isActive: scheduleIsActive },
    ];

    const activeIndex = Math.max(
        0,
        tabs.findIndex((tab) => tab.isActive),
    );

    return (
        <nav className="navbar">
            <div className="navbar-track">
                <span
                    className="navbar-indicator"
                    style={{ transform: `translateX(${activeIndex * 100}%)` }}
                    aria-hidden="true"
                />
                {tabs.map((tab) => (
                    <Link
                        key={tab.to}
                        className={`nav-link${tab.isActive ? " nav-link-active" : ""}`}
                        to={tab.to}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
