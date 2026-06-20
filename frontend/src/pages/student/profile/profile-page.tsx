import { type MouseEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut01 } from "@untitledui/icons/LogOut01";
import {
    AuthApiError,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    logout,
} from "../../../entities/auth";
import {
    getCurrentStudent,
    getStudentGamification,
    getStudentTeam,
} from "../../../entities/students/api/profile.api";
import type { CurrentUser, Student } from "../../../entities/students/model/profile.types";
import "./profile-page.css";

const DEFAULT_AVATAR_SRC = "/default-avatar.svg";

function isStudentProfile(user: CurrentUser): user is Student {
    return "year_of_study" in user;
}

function getRoleLabel(user: CurrentUser | null) {
    if (!user) {
        return "Студент";
    }

    if (isStudentProfile(user)) {
        return "Студент";
    }

    if (user.staff_role === "Teacher") {
        return "Преподаватель";
    }

    if (user.staff_role === "Admin") {
        return "Организатор";
    }

    return user.staff_role;
}

export function ProfilePage() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR_SRC);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [stats, setStats] = useState({
        achievements: 0,
        points: 0,
        sigmaCoins: 0,
    });
    const [teamName, setTeamName] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            const accessToken = getAccessToken();
            if (!accessToken) {
                navigate({ to: "/login" });
                return;
            }

            setIsProfileLoading(true);

            try {
                const user = await getCurrentStudent();
                setCurrentUser(user);
                setAvatarSrc(user.avatar_url ?? DEFAULT_AVATAR_SRC);

                if (isStudentProfile(user)) {
                    try {
                        const gamification = await getStudentGamification(user.id);
                        setStats({
                            achievements: gamification.achievement_score,
                            points: gamification.total_score,
                            sigmaCoins: gamification.extracurricular_score,
                        });
                    } catch (error) {
                        if (error instanceof AuthApiError && error.status === 404) {
                            setStats({
                                achievements: 0,
                                points: 0,
                                sigmaCoins: 0,
                            });
                        } else {
                            throw error;
                        }
                    }

                    try {
                        const team = await getStudentTeam(user.id);
                        setTeamName(team.team_name);
                    } catch (error) {
                        if (error instanceof AuthApiError && error.status === 404) {
                            setTeamName(null);
                        } else {
                            throw error;
                        }
                    }
                } else {
                    setStats({
                        achievements: 0,
                        points: 0,
                        sigmaCoins: 0,
                    });
                    setTeamName(null);
                }
            } catch (error) {
                if (error instanceof AuthApiError && error.status === 401) {
                    clearAuthTokens();
                    navigate({ to: "/login" });
                    return;
                }
            } finally {
                setIsProfileLoading(false);
            }
        };

        void loadProfile();
    }, [navigate]);

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        try {
            if (accessToken || refreshToken) {
                await logout({ refresh_token: refreshToken }, accessToken);
            }
        } catch {
            // Logout continues locally even if the API request fails.
        } finally {
            clearAuthTokens();
            setIsLoggingOut(false);
            navigate({ to: "/enter" });
        }
    };

    const openCurricularCharges = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        navigate({ to: "/curricular", hash: "charges" });
    };

    const openCharges = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        navigate({ to: "/extracurricular", hash: "charges" });
    };

    const openCurricularAchievements = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        navigate({ to: "/curricular-achievements" });
    };

    return (
        <main className="profile-page">
            <section className="user-info-section">
                <div className="logout-menu">
                    <button
                        className="logout-trigger"
                        type="button"
                        aria-label="Выйти"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        <LogOut01 className="profile-action-icon profile-action-icon--logout" size={24} color="currentColor" />
                    </button>
                </div>

                <Link
                    className="profile-settings-link"
                    to="/profile-settings"
                    aria-label="Открыть настройки профиля"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="profile-action-icon profile-action-icon--edit"
                    >
                        <path
                            d="M4.75 19.25H8.3L18.61 8.94C19.39 8.16 19.39 6.89 18.61 6.11L17.89 5.39C17.11 4.61 15.84 4.61 15.06 5.39L4.75 15.7V19.25Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M13.75 6.75L17.25 10.25"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </Link>

                <div className="profile-avatar-wrap">
                    <img
                        className="profile-image"
                        src={avatarSrc}
                        alt="Аватар пользователя"
                        onError={() => setAvatarSrc(DEFAULT_AVATAR_SRC)}
                    />
                </div>

                <h1 className="user-fullname">
                    {currentUser ? (
                        <>
                            {currentUser.last_name}
                            <br />
                            {currentUser.first_name}
                        </>
                    ) : (
                        <>
                            Фамилия
                            <br />
                            Имя
                        </>
                    )}
                </h1>

                <p className="user-role">{getRoleLabel(currentUser)}</p>
                <div className="user-stats">
                    <div className="stats-item">
                        <div className="stats-value">
                            <img src="/raster-icons/star.png" alt="" />
                            <p>{isProfileLoading ? "..." : stats.achievements}</p>
                        </div>
                        <p className="stats-label">ачивок</p>
                    </div>

                    <div className="stats-item">
                        <div className="stats-value">
                            <img src="/raster-icons/flash.png" alt="" />
                            <p>{isProfileLoading ? "..." : stats.points}</p>
                        </div>
                        <p className="stats-label">баллов</p>
                    </div>

                    <div className="stats-item">
                        <div className="stats-value">
                            <img src="/raster-icons/sigmacoins.png" alt="" />
                            <p>{isProfileLoading ? "..." : stats.sigmaCoins}</p>
                        </div>
                        <p className="stats-label">сигмакойнов</p>
                    </div>
                </div>
            </section>

            <section className="activities-section">
                <h2 className="activities-title">Мои активности</h2>

                <div className="activities-list">
                    <div
                        className="activity-card"
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate({ to: "/curricular" })}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                navigate({ to: "/curricular" });
                            }
                        }}
                    >
                        <img className="activity-image" src="/student/activity-learning.png" alt="" />

                        <div className="activity-info">
                            <h3>Учебная активность</h3>
                            <Link to="/curricular" hash="charges" onClick={openCurricularCharges}>
                                Посмотреть начисления
                            </Link>
                            <Link to="/curricular-achievements" onClick={openCurricularAchievements}>
                                Посмотреть ачивки
                            </Link>
                        </div>
                    </div>

                    <div
                        className="activity-card"
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate({ to: "/extracurricular" })}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                navigate({ to: "/extracurricular" });
                            }
                        }}
                    >
                        <img className="activity-image" src="/student/activity-extracurricular.png" alt="" />

                        <div className="activity-info">
                            <h3>Внеучебка</h3>
                            <div className="team-meta">
                                <p className="team-my" onClick={(event) => event.stopPropagation()}>
                                    {teamName ?? "Команда не назначена"}
                                </p>
                                <Link to="/extracurricular" hash="charges" onClick={openCharges}>
                                    Посмотреть начисления
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    );
}
