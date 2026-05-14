import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./team-creation-page.css";

const candidates = [
    "Иван Алексеев",
    "Мария Соколова",
    "Андрей Петров",
    "Ева Морозова",
    "Дмитрий Волков",
    "Анна Лебедева",
    "Никита Орлов",
];

export function TeamCreationPage() {
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState(candidates.slice(0, 2));
    const [memberName, setMemberName] = useState("");

    const filteredCandidates = candidates.filter((candidate) => {
        const query = memberName.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return candidate.toLowerCase().includes(query);
    });

    const addMember = (name: string) => {
        setMembers((items) => (items.includes(name) ? items : [...items, name]));
        setMemberName("");
    };

    const formatMemberName = (name: string) => {
        const [firstName = "", lastName = ""] = name.split(" ");

        if (!lastName) {
            return firstName;
        }

        return `${lastName} ${firstName[0]}.`;
    };

    const createTeam = () => {
        const createdTeam = {
            id: Date.now(),
            title: teamName.trim() || "Название команды",
            direction: "Созданная команда",
            captain: members[0] ?? "",
            count: `${members.length} участников`,
            color: "#7C3AED",
            members,
        };

        const savedTeams = JSON.parse(localStorage.getItem("createdTeams") ?? "[]");
        localStorage.setItem("createdTeams", JSON.stringify([...savedTeams, createdTeam]));
        navigate({ to: "/team-formation" });
    };

    return (
        <main className="team-creation-page" aria-label="Создание команды">
            <aside className="team-creation-sidebar" aria-label="Навигация">
                <img className="team-creation-sidebar__reference" src="/sidebar-navigation.svg" alt="" aria-hidden="true" />
                <button className="team-creation-sidebar__hotspot team-creation-sidebar__hotspot--logo team-creation-clickable" type="button" aria-label="Главная" />
                <button className="team-creation-sidebar__hotspot team-creation-sidebar__hotspot--users team-creation-clickable" type="button" aria-label="Участники" />
                <button className="team-creation-sidebar__hotspot team-creation-sidebar__hotspot--calendar team-creation-clickable" type="button" aria-label="Мероприятия" />
                <button className="team-creation-sidebar__hotspot team-creation-sidebar__hotspot--courses team-creation-clickable" type="button" aria-label="Курсы" />
                <button className="team-creation-sidebar__hotspot team-creation-sidebar__hotspot--teams team-creation-clickable" type="button" aria-label="Команды" />
                <button className="team-creation-sidebar__hotspot team-creation-sidebar__hotspot--settings team-creation-clickable" type="button" aria-label="Настройки" />
                <button className="team-creation-sidebar__hotspot team-creation-sidebar__hotspot--profile team-creation-clickable" type="button" aria-label="Профиль" />
            </aside>

            <section className="team-creation-workspace">
                <header className="team-creation-header">
                    <div className="team-creation-header__left">
                        <h1>Создание команды</h1>
                        <p>Заполните данные и выберите участников</p>
                    </div>
                    <div className="team-creation-header__actions">
                        <button className="team-creation-light-button team-creation-clickable" type="button" onClick={() => navigate({ to: "/team-formation" })}>
                            Отмена
                        </button>
                        <button className="team-creation-primary-button team-creation-clickable" type="button" onClick={createTeam}>
                            Создать
                        </button>
                    </div>
                </header>

                <section className="team-creation-form" aria-label="Параметры команды">
                    <label className="team-creation-field">
                        <span>Название команды</span>
                        <input value={teamName} placeholder="Например: Сигма-тим" onChange={(event) => setTeamName(event.target.value)} />
                    </label>

                    <h2 className="team-creation-section-title">Выберите участников</h2>

                    <div className="team-creation-tags" aria-label="Участники команды">
                        {members.map((member, index) => (
                            <button
                                className="team-creation-tag team-creation-clickable"
                                type="button"
                                key={`${member}-${index}`}
                                onClick={() => setMembers((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                            >
                                <span>{formatMemberName(member)}</span>
                                <span className="team-creation-tag__remove">×</span>
                            </button>
                        ))}
                    </div>

                    <div className="team-creation-add-row">
                        <input value={memberName} placeholder="Введите ФИО участника" onChange={(event) => setMemberName(event.target.value)} />
                    </div>

                    <div className="team-creation-search-results" aria-label="Найденные участники">
                        {filteredCandidates.map((candidate) => (
                            <div className="team-creation-search-result" key={candidate}>
                                <span>{candidate}</span>
                                {members.includes(candidate) ? (
                                    <button
                                        className="team-creation-remove team-creation-clickable"
                                        type="button"
                                        aria-label={`Удалить ${candidate}`}
                                        onClick={() => setMembers((items) => items.filter((item) => item !== candidate))}
                                    >
                                        ×
                                    </button>
                                ) : (
                                    <button className="team-creation-add-button team-creation-clickable" type="button" aria-label={`Добавить ${candidate}`} onClick={() => addMember(candidate)}>
                                        <img src="/Button-add.svg" alt="" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </section>
        </main>
    );
}
