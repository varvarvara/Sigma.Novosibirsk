import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { AuthApiError } from "../../../api/auth";
import { getMyAchievements, type StudentAchievementDetailedOut } from "../../../api/students/learning";
import "./curricular-achievements.css";

type SubjectGroup = {
    title: string;
    achievements: Array<{
        id: string;
        title: string;
        text: string;
        icon: string;
        tone: "violet";
    }>;
};

function formatAchievementDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Дата неизвестна";
    }
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
}

function mapAchievementsToSubjects(items: StudentAchievementDetailedOut[]): SubjectGroup[] {
    const grouped = new Map<string, SubjectGroup>();

    for (const item of items) {
        const group = grouped.get(item.course_title) ?? {
            title: item.course_title,
            achievements: [],
        };

        group.achievements.push({
            id: `achievement-${item.id}`,
            title: item.achievement_name,
            text: formatAchievementDate(item.awarded_at),
            icon: "/star.svg",
            tone: "violet",
        });

        grouped.set(item.course_title, group);
    }

    return Array.from(grouped.values());
}

export function CurricularAchievementsPage() {
    const { hash } = useLocation();
    const [subjects, setSubjects] = useState<SubjectGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [highlightedAchievementId, setHighlightedAchievementId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const achievements = await getMyAchievements();
                setSubjects(mapAchievementsToSubjects(achievements));
            } catch (error) {
                if (error instanceof AuthApiError) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("Не удалось загрузить ачивки.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, []);

    useEffect(() => {
        if (!hash) {
            return;
        }

        const targetAchievement = document.getElementById(hash);
        if (!targetAchievement) {
            return;
        }

        targetAchievement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedAchievementId(hash);

        const timeoutId = window.setTimeout(() => {
            setHighlightedAchievementId((current) => (current === hash ? null : current));
        }, 1500);

        return () => window.clearTimeout(timeoutId);
    }, [hash]);

    return (
        <main className="curricular-achievements-page">
            <header className="curricular-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/profile" aria-label="Назад в профиль">
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1>Учебная активность</h1>
            </header>

            <div className="curricular-achievements-content">
                {isLoading ? <p className="curricular-achievements-status">Загрузка ачивок...</p> : null}
                {!isLoading && errorMessage ? (
                    <p className="curricular-achievements-status">{errorMessage}</p>
                ) : null}
                {!isLoading && !errorMessage && subjects.length === 0 ? (
                    <p className="curricular-achievements-empty">На данный момент ачивок нет</p>
                ) : null}

                {subjects.map((subject) => (
                    <section className="achievements-subject" key={subject.title}>
                        <h2>{subject.title}</h2>

                        <div className="achievements-grid">
                            {subject.achievements.map((achievement, index) => (
                                <article
                                    id={achievement.id}
                                    className={`achievement-card${highlightedAchievementId === achievement.id ? " achievement-card-highlighted" : ""}`}
                                    key={`${subject.title}-${achievement.title}-${index}`}
                                >
                                    <div className={`achievement-image achievement-image-${achievement.tone}`}>
                                        <img src={achievement.icon} alt="" />
                                    </div>
                                    <h3>{achievement.title}</h3>
                                    <p>{achievement.text}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

        </main>
    );
}
