import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { warmRoute } from "../../../app/route-warmers";
import { AuthApiError } from "../../../entities/auth";
import {
    useMyAchievementsQuery,
    useMyAttendanceChargesQuery,
    useMyAttendanceDashboardQuery,
    useMyAttendanceFilterOptionsQuery,
    useMyEnrollmentsQuery,
} from "../../../entities/student/queries/learning.queries";
import {
    useCurrentUserQuery,
    useStudentGamificationQuery,
} from "../../../entities/student/queries/profile.queries";
import type { Student } from "../../../entities/student/model/profile.types";
import { applyAchievementFilter, applyChargesFilter, groupLearningCharges } from "../../../features/curricular-filter/lib/charge-groups";
import {
    CURRICULAR_CHARGES_FILTER_KEY,
    readCurricularChargesFilter,
} from "../../../features/curricular-filter/model/curricular-charges-filter";
import "./curricular.css";

function isStudentProfile(user: unknown): user is Student {
    return Boolean(user && typeof user === "object" && "year_of_study" in user);
}

export default function CurricularContent() {
    const { hash } = useLocation();
    const [filterRevision, setFilterRevision] = useState(0);

    const { data: currentUser, error: currentUserError } = useCurrentUserQuery();
    const studentId = isStudentProfile(currentUser) ? currentUser.id : undefined;
    const { data: gamification } = useStudentGamificationQuery(studentId);
    const { data: attendanceDashboard, error: dashboardError, isLoading: isDashboardLoading } = useMyAttendanceDashboardQuery();
    const { data: enrollments, error: enrollmentsError, isLoading: isEnrollmentsLoading } = useMyEnrollmentsQuery();
    const { data: filterOptions, error: filterOptionsError, isLoading: isFilterOptionsLoading } = useMyAttendanceFilterOptionsQuery();
    const { data: charges, error: chargesError, isLoading: isChargesLoading } = useMyAttendanceChargesQuery();
    const { data: achievements, error: achievementsError, isLoading: isAchievementsLoading } = useMyAchievementsQuery();

    const isLoading =
        isDashboardLoading ||
        isEnrollmentsLoading ||
        isFilterOptionsLoading ||
        isChargesLoading ||
        isAchievementsLoading;

    const errorMessage =
        currentUserError instanceof AuthApiError ? currentUserError.message :
        dashboardError instanceof AuthApiError ? dashboardError.message :
        enrollmentsError instanceof AuthApiError ? enrollmentsError.message :
        filterOptionsError instanceof AuthApiError ? filterOptionsError.message :
        chargesError instanceof AuthApiError ? chargesError.message :
        achievementsError instanceof AuthApiError ? achievementsError.message :
        currentUserError || dashboardError || enrollmentsError || filterOptionsError || chargesError || achievementsError
            ? "Не удалось загрузить учебную активность."
            : "";

    const attendancePoints = attendanceDashboard?.attendance_points ?? 0;
    const achievementPoints = gamification?.achievement_score ?? 0;
    const hasEnrollments = (enrollments ?? []).some((item) => item.enrollment_status === "Active");
    const hasActiveEnrollments = hasEnrollments && (filterOptions?.courses.length ?? 0) > 0;

    useEffect(() => {
        if (hash === "charges") {
            document.getElementById("curricular-charges")?.scrollIntoView({ block: "start" });
        }
    }, [hash]);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === CURRICULAR_CHARGES_FILTER_KEY) {
                setFilterRevision((value) => value + 1);
            }
        };

        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const chargeGroups = useMemo(() => {
        if (!hasActiveEnrollments) {
            return [];
        }

        const filter = readCurricularChargesFilter();
        const filteredCharges = applyChargesFilter(charges ?? [], filter);
        const filteredAchievements = applyAchievementFilter(achievements ?? [], filter);

        return groupLearningCharges(filteredCharges, filteredAchievements);
    }, [achievements, charges, filterRevision, hasActiveEnrollments]);

    const totalPoints = useMemo(() => attendancePoints + achievementPoints, [attendancePoints, achievementPoints]);

    return (
        <main className="curricular-page">
            <header className="curricular-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/profile" aria-label="Назад в профиль">
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1>Учебная активность</h1>
            </header>

            <section className="curricular-summary">
                <div className="summary-main">
                    <img src="/raster-icons/flash.png" alt="" />
                    <p>{isLoading ? "..." : totalPoints}</p>
                </div>

                <div className="summary-details">
                    <div>
                        <h2>посещаемость</h2>
                        <p>
                            <img src="/raster-icons/magic.png" alt="" />
                            <span>{isLoading ? "..." : attendancePoints}</span>
                        </p>
                    </div>
                    <div>
                        <h2>ачивки</h2>
                        <p>
                            <img src="/raster-icons/star.png" alt="" />
                            <span>{isLoading ? "..." : achievementPoints}</span>
                        </p>
                    </div>
                </div>
            </section>

            {hasActiveEnrollments ? (
                <section className="curricular-charges" id="curricular-charges">
                    <div className="curricular-charges-header">
                        <h2>Начисления</h2>
                        <Link
                            className="curricular-filter-button"
                            to="/curricular-filter"
                            aria-label="Фильтр начислений"
                            onPointerEnter={() => warmRoute("/curricular-filter")}
                            onFocus={() => warmRoute("/curricular-filter")}
                        >
                            <img src="/filter.svg" alt="" />
                        </Link>
                    </div>

                    <div className="curricular-charges-list">
                        {errorMessage ? <p className="curricular-charge-info">{errorMessage}</p> : null}
                        {!errorMessage && !isLoading && chargeGroups.length === 0 ? (
                            <p className="curricular-charge-info">Начислений по выбранному фильтру пока нет.</p>
                        ) : null}

                        {chargeGroups.map((group) => (
                            <div className="curricular-charge-group" key={group.dateKey}>
                                <div className="curricular-date-row">
                                    <p>{group.dateLabel}</p>
                                </div>

                                {group.items.map((item) => (
                                    <article className="curricular-charge-row" key={item.id}>
                                        <div className="curricular-charge-info">
                                            <h3>{item.title}</h3>
                                            <p>{item.value}</p>
                                            {item.description ? (
                                                <p className="curricular-charge-description">{item.description}</p>
                                            ) : null}
                                            {item.kind === "achievement" ? (
                                                <Link
                                                    className="curricular-achievement-link"
                                                    to="/curricular-achievements"
                                                    aria-label="Открыть список ачивок"
                                                    onPointerEnter={() => warmRoute("/curricular-achievements")}
                                                    onFocus={() => warmRoute("/curricular-achievements")}
                                                >
                                                    Ачивки
                                                </Link>
                                            ) : null}
                                        </div>
                                        <div className="curricular-charge-points">
                                            <span>{item.points}</span>
                                            <img src={item.iconSrc} alt="" />
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}
        </main>
    );
}
