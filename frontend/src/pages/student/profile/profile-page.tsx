import { type ChangeEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CameraPlus } from "@untitledui/icons/CameraPlus";
import { LogOut01 } from "@untitledui/icons/LogOut01";
import {
    AuthApiError,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    logout,
} from "../../../api/auth";
import {
    getCurrentStudent,
    getStudentGamification,
    getStudentTeam,
    uploadMyAvatar,
    type CurrentUser,
    type Student,
} from "../../../api/students/profile";
import "./profile-page.css";

const DEFAULT_AVATAR_SRC = "/default-avatar.svg";
const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

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
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [stats, setStats] = useState({
        achievements: 0,
        points: 0,
        sigmaCoins: 0,
    });
    const [teamName, setTeamName] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);

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

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            alert("Нужно выбрать файл изображения.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size > AVATAR_MAX_SIZE_BYTES) {
            alert("Максимальный размер аватара: 5 МБ.");
            event.target.value = "";
            return;
        }

        setIsAvatarUploading(true);

        try {
            const uploaded = await uploadMyAvatar(selectedFile);
            setAvatarSrc(uploaded.avatar_url || DEFAULT_AVATAR_SRC);
        } catch (error) {
            if (error instanceof AuthApiError) {
                alert(error.message);
            } else {
                alert("Не удалось загрузить аватар.");
            }
        } finally {
            setIsAvatarUploading(false);
            event.target.value = "";
        }
    };

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
                        <LogOut01 size={20} color="#2A282F" />
                    </button>
                </div>

                <button
                    className="profile-avatar-button"
                    type="button"
                    aria-label="Загрузить фото профиля"
                    disabled={isAvatarUploading}
                    onClick={() => avatarInputRef.current?.click()}
                >
                    <img
                        className="profile-image"
                        src={avatarSrc}
                        alt="Аватар пользователя"
                        onError={() => setAvatarSrc(DEFAULT_AVATAR_SRC)}
                    />
                    <span className="profile-avatar-edit" aria-hidden="true">
                        <CameraPlus size={14} color="#FFFFFF" />
                    </span>
                </button>
                <input
                    ref={avatarInputRef}
                    className="profile-avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                />

                <h1 className="user-fullname semi-bold-text">
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

                <p className="user-role semi-bold-text">{getRoleLabel(currentUser)}</p>
                <div className="user-stats">
                    <div className="stats-item">
                        <div className="stats-value">
                            <img src="/star.svg" alt="" />
                            <p>{isProfileLoading ? "..." : stats.achievements}</p>
                        </div>
                        <p className="stats-label">ачивок</p>
                    </div>

                    <div className="stats-item">
                        <div className="stats-value">
                            <img src="/flash.svg" alt="" />
                            <p>{isProfileLoading ? "..." : stats.points}</p>
                        </div>
                        <p className="stats-label">баллов</p>
                    </div>

                    <div className="stats-item">
                        <div className="stats-value">
                            <img src="/sigmacoins.svg" alt="" />
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
                        <img className="activity-image" src="/star.svg" alt="" />

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
                        <img className="activity-image" src="/flash.svg" alt="" />

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
