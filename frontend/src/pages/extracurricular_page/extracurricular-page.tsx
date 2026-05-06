import { Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "../../widgets/navbar/navbar";
import "./extracurricular-page.css";

const teamMembers = [
    "Фамилия Имя",
    "Фамилия Имя",
    "Фамилия Имя",
    "Фамилия Имя",
];

const memberAvatars = [
    { id: 1, src: "/avatar-1.png" },
    { id: 2, src: "/avatar-2.png" },
    { id: 3, src: "/avatar-3.png" },
    { id: 4, src: "/avatar-4.png" },
];

const ratingTeams = [
    { place: 1, icon: "/rating-1.svg", title: "Название команды", members: "ФИ, ФИ" },
    { place: 2, icon: "/rating-2.svg", title: "Название команды", members: "ФИ, ФИ" },
    { place: 3, icon: "/rating-3.svg", title: "Название команды", members: "ФИ, ФИ" },
];

const charges = [
    { id: 1, date: "29.07", title: "Название внеучебки", value: "Ведущий", coins: "+20" },
    { id: 2, date: "30.07", title: "Название внеучебки", value: "Ведущий", coins: "+20" },
];

export function ExtracurricularPage() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash === "charges") {
            document.getElementById("charges")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [hash]);

    return (
        <main className="extracurricular-page">
            <header className="extracurricular-header">
                <Link className="back-button" to="/profile" aria-label="Назад">
                    <span />
                </Link>
                <h1>Внеучебка // Внеучебная активность</h1>
            </header>

            <section className="team-card">
                <div className="team-content">
                    <div className="team-text">
                        <div className="team-avatars" aria-label="Участники команды">
                            {memberAvatars.map((member) => (
                                <img key={member.id} src={member.src} alt="" />
                            ))}
                        </div>
                        <h1>Название команды</h1>
                        <div className="team-members">
                            {teamMembers.map((member, index) => (
                                <p key={`${member}-${index}`}>{member}</p>
                            ))}
                        </div>
                    </div>

                    <div className="team-stats">
                        <div>
                            <img src="/sigmacoins.svg" alt="" />
                            <p><span>500</span> сигмакоинов</p>
                        </div>
                        <div>
                            <img src="/rating-place.svg" alt="" />
                            <p><span>1</span> место в рейтинге</p>
                            
                        </div>
                    </div>
                </div>
            </section>

            <section className="rating-panel">
                <h2>Рейтинг</h2>

                <div className="rating-list">
                    {ratingTeams.map((team) => (
                        <article className="activity-row" key={team.place}>
                            <div className="rating-place">
                                <span>{team.place}</span>
                                <img src={team.icon} alt="" />
                            </div>
                            <div className="rating-info">
                                <h3>{team.title}</h3>
                                <p>{team.members}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="charges-panel" id="charges">
                <h2>Начисления</h2>

                <div className="charges-list">
                    {charges.map((charge) => (
                        <div className="charge-group" key={charge.id}>
                            <p className="charge-date">{charge.date}</p>
                            <article className="charge-row">
                                <div className="charge-info">
                                    <h3>{charge.title}</h3>
                                    <p>{charge.value}</p>
                                </div>
                                <div className="charge-coins">
                                    <span>{charge.coins}</span>
                                    <img src="/sigmacoins.svg" alt="" />
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </section>

            <Navbar />
        </main>
    );
}
