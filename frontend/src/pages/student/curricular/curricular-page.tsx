import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { AuthApiError } from "../../../entities/auth";
import {
    getMyAttendanceCharges,
    getMyAttendanceDashboard,
    getMyAttendanceFilterOptions,
    getMyAchievements,
    getMyEnrollments,
} from "../../../entities/student/api/learning.api";
import { getCurrentStudent, getStudentGamification } from "../../../entities/student/api/profile.api";
import type { Student } from "../../../entities/student/model/profile.types";
import {
    type ChargeGroup,
    applyAchievementFilter,
    applyChargesFilter,
    groupLearningCharges,
} from "../../../features/curricular-filter/lib/charge-groups";
import {
    CURRICULAR_CHARGES_FILTER_KEY,
    readCurricularChargesFilter,
} from "../../../features/curricular-filter/model/curricular-charges-filter";
import "./curricular.css";

function isStudentProfile(user: unknown): user is Student {
    return Boolean(user && typeof user === "object" && "year_of_study" in user);
}

export function CurricularPage() {
    const { hash, pathname } = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [attendancePoints, setAttendancePoints] = useState(0);
    const [achievementPoints, setAchievementPoints] = useState(0);
    const [hasActiveEnrollments, setHasActiveEnrollments] = useState(false);
    const [chargeGroups, setChargeGroups] = useState<ChargeGroup[]>([]);
    const [filterRevision, setFilterRevision] = useState(0);

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

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const [currentUser, attendance, enrollments] = await Promise.all([
                    getCurrentStudent(),
                    getMyAttendanceDashboard(),
                    getMyEnrollments(),
                ]);

                const hasEnrollments = enrollments.some((item) => item.enrollment_status === "Active");
                setHasActiveEnrollments(hasEnrollments);

                let achievementScore = 0;
                if (isStudentProfile(currentUser)) {
                    try {
                        const gamification = await getStudentGamification(currentUser.id);
                        achievementScore = gamification.achievement_score;
                    } catch {
                        achievementScore = 0;
                    }
                }

                setAttendancePoints(attendance.attendance_points);
                setAchievementPoints(achievementScore);

                if (hasEnrollments) {
                    const [filterOptions, charges, achievements] = await Promise.all([
                        getMyAttendanceFilterOptions(),
                        getMyAttendanceCharges(),
                        getMyAchievements(),
                    ]);

                    setHasActiveEnrollments(filterOptions.courses.length > 0);

                    const filter = readCurricularChargesFilter();
                    const filteredCharges = applyChargesFilter(charges, filter);
                    const filteredAchievements = applyAchievementFilter(achievements, filter);
                    setChargeGroups(groupLearningCharges(filteredCharges, filteredAchievements));
                } else {
                    setChargeGroups([]);
                }
            } catch (error) {
                if (error instanceof AuthApiError) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("Не удалось загрузить учебную активность.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [filterRevision, pathname]);

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
                        <Link className="curricular-filter-button" to="/curricular-filter" aria-label="Фильтр начислений">
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
