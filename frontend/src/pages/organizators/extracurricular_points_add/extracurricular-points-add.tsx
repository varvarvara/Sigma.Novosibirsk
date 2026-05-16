import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./extracurricular-points-add.css";

type TeamScore = {
    id: number;
    name: string;
    points: number;
    visited: boolean;
};

type SavedTeam = {
    id: number;
    title: string;
    points?: number;
};

const defaultTeams: SavedTeam[] = [
    { id: 1, title: "Команда медиа" },
    { id: 2, title: "Команда событий" },
    { id: 3, title: "Команда дизайна" },
    { id: 4, title: "Команда разработки" },
];

const getInitialTeams = (): TeamScore[] => {
    const savedTeams = JSON.parse(localStorage.getItem("createdTeams") ?? "[]") as SavedTeam[];
    const teams = [...defaultTeams, ...savedTeams];

    return teams.map((team, index) => ({
        id: team.id || index + 1,
        name: team.title,
        points: 0,
        visited: false,
    }));
};

const getSearchValue = (key: string, fallback: string) => {
    const params = new URLSearchParams(window.location.search);

    return params.get(key) || fallback;
};

const formatResponsible = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);

    return `${parts[1] ?? parts[0]} ${parts[0]?.[0] ?? ""}.`;
};

export function ExtracurricularPointsAddPage() {
    const navigate = useNavigate();
    const sidebarAvatarSrc = localStorage.getItem("orgProfileAvatar") ?? "/teacher/profile/avatar-profile.png";
    const [teams, setTeams] = useState<TeamScore[]>(getInitialTeams);
    const [query, setQuery] = useState("");
    const [notice, setNotice] = useState("Черновик");

    const title = getSearchValue("title", "Название");
    const date = getSearchValue("date", "24 октября");
    const time = getSearchValue("time", "15:00");
    const organizer = getSearchValue("organizer", "Иванова Анна");

    const filteredTeams = useMemo(() => {
        const value = query.trim().toLowerCase();

        if (!value) {
            return teams;
        }

        return teams.filter((team) => team.name.toLowerCase().includes(value));
    }, [teams, query]);

    const visitedCount = teams.filter((team) => team.visited).length;
    const totalPoints = teams.reduce((sum, team) => sum + team.points, 0);

    const updateTeam = (id: number, patch: Partial<TeamScore>) => {
        setTeams((items) => items.map((team) => (team.id === id ? { ...team, ...patch } : team)));
    };

    const savePoints = () => {
        const teamPoints = JSON.parse(localStorage.getItem("teamPoints") ?? "{}") as Record<string, number>;
        const savedTeams = JSON.parse(localStorage.getItem("createdTeams") ?? "[]") as SavedTeam[];
        const nextTeamPoints = teams.reduce<Record<string, number>>((acc, team) => {
            acc[team.name] = (acc[team.name] ?? 200) + team.points;
            return acc;
        }, { ...teamPoints });
        const nextSavedTeams = savedTeams.map((team) => ({
            ...team,
            points: nextTeamPoints[team.title] ?? team.points ?? 200,
        }));

        localStorage.setItem("teamPoints", JSON.stringify(nextTeamPoints));
        localStorage.setItem("createdTeams", JSON.stringify(nextSavedTeams));
        localStorage.setItem(
            "extracurricularPoints",
            JSON.stringify({
                title,
                date,
                time,
                organizer,
                teams,
            }),
        );
        setNotice("Сохранено");
        navigate({ to: "/org-extracurricular" });
    };

    return (
        <main className="points-add-page" aria-label="Начисление баллов">
            <aside className="points-sidebar" aria-label="Навигация">
                <img className="points-sidebar__reference" src="/sidebar-navigation.svg" alt="" aria-hidden="true" />
                <img className="points-sidebar__avatar" src={sidebarAvatarSrc} alt="" aria-hidden="true" />
                <button className="points-sidebar__hotspot points-sidebar__hotspot--logo points-clickable" type="button" aria-label="Главная" />
                <button className="points-sidebar__hotspot points-sidebar__hotspot--users points-clickable" type="button" aria-label="Участники" />
                <button className="points-sidebar__hotspot points-sidebar__hotspot--calendar points-clickable" type="button" aria-label="Мероприятия" />
                <button className="points-sidebar__hotspot points-sidebar__hotspot--courses points-clickable" type="button" aria-label="Курсы" />
                <button className="points-sidebar__hotspot points-sidebar__hotspot--teams points-clickable" type="button" aria-label="Команды" />
                <button className="points-sidebar__hotspot points-sidebar__hotspot--settings points-clickable" type="button" aria-label="Настройки" />
                <button className="points-sidebar__hotspot points-sidebar__hotspot--profile points-clickable" type="button" aria-label="Профиль" onClick={() => navigate({ to: "/org-profile" })} />
            </aside>

            <section className="points-workspace">
                <header className="points-header">
                    <button className="points-back-button points-clickable" type="button" aria-label="Назад" onClick={() => navigate({ to: "/org-extracurricular" })}>
                        <img src="/Back-Button.svg" alt="" />
                    </button>
                    <div className="points-header__left">
                        <h1>{title}</h1>
                        <p>{date} • {time}-17:00 | Ответственный: {formatResponsible(organizer)}</p>
                        <nav className="points-tabs" aria-label="Разделы внеучебки">
                            <button className="points-tabs__item points-tabs__item--active points-clickable" type="button" onClick={() => navigate({ to: "/org-extracurricular" })}>Мероприятия</button>
                            <button className="points-tabs__item points-clickable" type="button" onClick={() => navigate({ to: "/team-formation" })}>Команды</button>
                            <button className="points-tabs__item points-clickable" type="button">Рейтинг</button>
                        </nav>
                    </div>
                    <div className="points-header__actions">
                    </div>
                </header>

                <div className="points-tools">
                    <button
                        className="points-light-button points-clickable"
                        type="button"
                        onClick={savePoints}
                    >
                        Сохранить посещаемость
                    </button>
                </div>

                <section className="points-panel" aria-label="Начисление баллов">
                    <div className="points-table" role="table" aria-label="Участники">
                        <div className="points-table__header" role="row">
                            <span>Команда</span>
                            <span>Статус</span>
                            <span>Баллы</span>
                            <span />
                        </div>
                        <div className="points-table__body">
                            {filteredTeams.map((team) => (
                                <div className="points-row" role="row" key={team.id}>
                                    <span className="points-row__person">
                                        <span>{team.name}</span>
                                    </span>
                                    <button
                                        className={`points-visit-toggle points-clickable${team.visited ? " points-visit-toggle--active" : ""}`}
                                        type="button"
                                        onClick={() => updateTeam(team.id, { visited: !team.visited, points: team.visited ? 0 : team.points })}
                                        aria-label={team.visited ? "Присутствует" : "Отсутствует"}
                                    >
                                        <img src={team.visited ? "/present.svg" : "/absent.svg"} alt="" />
                                    </button>
                                    <input
                                        className="points-input"
                                        value={team.points}
                                        inputMode="numeric"
                                        onChange={(event) => updateTeam(team.id, { points: Number(event.target.value) || 0 })}
                                    />
                                    <button className="points-dropdown-button points-clickable" type="button" aria-label="Открыть">
                                        <img src="/Dropdown.svg" alt="" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}
