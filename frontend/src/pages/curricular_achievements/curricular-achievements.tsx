import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { Navbar } from "../../widgets/navbar/navbar";
import "./curricular-achievements.css";

const subjects = [
    {
        title: "Предмет 1",
        achievements: [
            { id: "subject-1-achievement-1", title: "Самый лучший вопрос", text: "23 июня", icon: "/sigmacoins.svg", tone: "violet" },
            { id: "subject-1-achievement-2", title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { id: "subject-1-achievement-3", title: "Самый лучший вопрос", text: "23 июня", icon: "/magic.svg", tone: "violet" },
            { id: "subject-1-achievement-4", title: "Самый лучший вопрос", text: "23 июня", icon: "/sigmacoins.svg", tone: "violet" },
            { id: "subject-1-achievement-5", title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { id: "subject-1-achievement-6", title: "Самый лучший вопрос", text: "23 июня", icon: "/star.svg", tone: "violet" },
        ],
    },
    {
        title: "Предмет 2",
        achievements: [
            { id: "subject-2-achievement-1", title: "Самый лучший вопрос", text: "23 июня", icon: "/star.svg", tone: "violet" },
            { id: "subject-2-achievement-2", title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { id: "subject-2-achievement-3", title: "Самый лучший вопрос", text: "23 июня", icon: "/magic.svg", tone: "violet" },
            { id: "subject-2-achievement-4", title: "Самый лучший вопрос", text: "23 июня", icon: "/sigmacoins.svg", tone: "violet" },
            { id: "subject-2-achievement-5", title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { id: "subject-2-achievement-6", title: "Самый лучший вопрос", text: "23 июня", icon: "/star.svg", tone: "violet" },
        ],
    },
];

export function CurricularAchievementsPage() {
    const { hash } = useLocation();
    const [highlightedAchievementId, setHighlightedAchievementId] = useState<string | null>(null);

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

            <Navbar />
        </main>
    );
}
