import { Link } from "@tanstack/react-router";
import { Navbar } from "../../widgets/navbar/navbar";
import "./curricular-achievements.css";

const subjects = [
    {
        title: "Предмет 1",
        achievements: [
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/sigmacoins.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/magic.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/sigmacoins.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/star.svg", tone: "violet" },
        ],
    },
    {
        title: "Предмет 2",
        achievements: [
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/star.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/magic.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/sigmacoins.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/flash.svg", tone: "violet" },
            { title: "Самый лучший вопрос", text: "23 июня", icon: "/star.svg", tone: "violet" },
        ],
    },
];

export function CurricularAchievementsPage() {
    return (
        <main className="curricular-achievements-page">
            <header className="curricular-header">
                <Link className="back-button" to="/profile" aria-label="Назад в профиль">
                    <span />
                </Link>
                <h1>Учебная активность</h1>
            </header>

            <div className="curricular-achievements-content">
                {subjects.map((subject) => (
                    <section className="achievements-subject" key={subject.title}>
                        <h2>{subject.title}</h2>

                        <div className="achievements-grid">
                            {subject.achievements.map((achievement, index) => (
                                <article className="achievement-card" key={`${subject.title}-${achievement.title}-${index}`}>
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
