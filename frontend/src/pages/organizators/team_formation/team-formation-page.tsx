import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./team-formation-page.css";

type Member = {
    id: number;
    name: string;
};

type Team = {
    id: number;
    title: string;
    direction: string;
    captain: string;
    count: string;
    color: string;
    points?: number;
    members?: string[];
};

const initialMembers: Member[] = [
    { id: 1, name: "Иван Алексеев"},
    { id: 2, name: "Мария Соколова"},
    { id: 3, name: "Андрей Петров" },
    { id: 4, name: "Ева Морозова" },
    { id: 5, name: "Дмитрий Волков"},
];

const memberColors = ["#7C3AED", "#EC4899", "#10B981", "#F59E0B", "#6366F1", "#0EA5E9", "#EF4444"];

const initialTeams: Team[] = [
    { id: 1, title: "Команда медиа", direction: "Контент и съемки", captain: "Иван Алексеев", count: "5 участников", color: "#10B981" },
    { id: 2, title: "Команда событий", direction: "Организация встреч", captain: "Ева Морозова", count: "4 участника", color: "#F59E0B" },
    { id: 3, title: "Команда дизайна", direction: "Айдентика сезона", captain: "Мария Соколова", count: "6 участников", color: "#EC4899" },
    { id: 4, title: "Команда разработки", direction: "Цифровые сервисы", captain: "Андрей Петров", count: "7 участников", color: "#6366F1" },
];

const getInitialTeams = () => {
    const savedTeams = JSON.parse(localStorage.getItem("createdTeams") ?? "[]") as Team[];
    const teamPoints = JSON.parse(localStorage.getItem("teamPoints") ?? "{}") as Record<string, number>;

    return [...initialTeams, ...savedTeams].map((team) => ({
        ...team,
        points: teamPoints[team.title] ?? team.points ?? 200,
    }));
};

const getTeamMembers = (team: Team) => team.members ?? initialMembers.map((member) => member.name);

const getMembersLabel = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
        return `${count} участник`;
    }

    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
        return `${count} участника`;
    }

    return `${count} участников`;
};

export function TeamFormationPage() {
    const navigate = useNavigate();
    const sidebarAvatarSrc = localStorage.getItem("orgProfileAvatar") ?? "/teacher/profile/avatar-profile.png";
    const [teamItems, setTeamItems] = useState<Team[]>(getInitialTeams);
    const [query, setQuery] = useState("");
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [activeMemberId, setActiveMemberId] = useState(initialMembers[0].id);
    const [activeTeamId, setActiveTeamId] = useState(teamItems[0].id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMainPanelVisible, setIsMainPanelVisible] = useState(true);
    const [isMainActionsHidden, setIsMainActionsHidden] = useState(false);
    const [hiddenActionTeamIds, setHiddenActionTeamIds] = useState<number[]>([]);
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [collapsedTeamIds, setCollapsedTeamIds] = useState<number[]>(teamItems.map((team) => team.id));
    const [notice, setNotice] = useState("Команды сформированы");

    const filteredMembers = useMemo(() => {
        const value = query.trim().toLowerCase();

        if (!value) {
            return members;
        }

        return members.filter((member) => member.name.toLowerCase().includes(value));
    }, [members, query]);

    const toggleTeamPanel = (id: number) => {
        setCollapsedTeamIds((ids) => (ids.includes(id) ? ids.filter((teamId) => teamId !== id) : [...ids, id]));
        setHiddenActionTeamIds((ids) => ids.filter((teamId) => teamId !== id));
        setActiveTeamId(id);
    };

    const deleteTeam = (id: number) => {
        const nextTeams = teamItems.filter((team) => team.id !== id);
        const savedTeams = nextTeams.filter((team) => !initialTeams.some((initialTeam) => initialTeam.id === team.id));

        setTeamItems(nextTeams);
        setActiveTeamId(nextTeams[0]?.id ?? 0);
        setCollapsedTeamIds((ids) => ids.filter((teamId) => teamId !== id));
        localStorage.setItem("createdTeams", JSON.stringify(savedTeams));
        setNotice("Команда удалена");
    };

    const deleteOpenedTeam = () => {
        const openedTeam = teamItems.find((team) => !collapsedTeamIds.includes(team.id));

        if (openedTeam) {
            deleteTeam(openedTeam.id);
        }
    };

    const saveTeams = () => {
        const savedTeams = teamItems.filter((team) => !initialTeams.some((initialTeam) => initialTeam.id === team.id));

        localStorage.setItem("createdTeams", JSON.stringify(savedTeams));
        setNotice("Изменения сохранены");
    };

    const hideTeamActions = (id: number) => {
        setHiddenActionTeamIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    };

    const removeTeamMember = (teamId: number, memberName: string) => {
        setTeamItems((items) =>
            items.map((team) => {
                if (team.id !== teamId) {
                    return team;
                }

                const nextMembers = getTeamMembers(team).filter((member) => member !== memberName);

                return {
                    ...team,
                    count: getMembersLabel(nextMembers.length),
                    members: nextMembers,
                };
            }),
        );
        setNotice("Участник удален");
    };

        return (
        <main className="team-formation-page" aria-label="Команды внеучебки">
            <aside className="team-sidebar" aria-label="Навигация">
                <img className="team-sidebar__reference" src="/sidebar-navigation.svg" alt="" aria-hidden="true" />
                <img className="team-sidebar__avatar" src={sidebarAvatarSrc} alt="" aria-hidden="true" />
                <button className="team-sidebar__hotspot team-sidebar__hotspot--logo team-clickable" type="button" aria-label="Главная" />
                <button className="team-sidebar__hotspot team-sidebar__hotspot--users team-clickable" type="button" aria-label="Участники" />
                <button className="team-sidebar__hotspot team-sidebar__hotspot--calendar team-clickable" type="button" aria-label="Мероприятия" />
                <button className="team-sidebar__hotspot team-sidebar__hotspot--courses team-clickable" type="button" aria-label="Курсы" />
                <button className="team-sidebar__hotspot team-sidebar__hotspot--teams team-clickable" type="button" aria-label="Команды" />
                <button className="team-sidebar__hotspot team-sidebar__hotspot--settings team-clickable" type="button" aria-label="Настройки" />
                <button className="team-sidebar__hotspot team-sidebar__hotspot--profile team-clickable" type="button" aria-label="Профиль" onClick={() => navigate({ to: "/org-profile" })} />
            </aside>

            <section className="team-workspace">
                <header className="team-header">
                    <div className="team-header__left">
                        <h1>Команды</h1>
                        <nav className="team-tabs" aria-label="Разделы внеучебки">
                            <button className="team-tabs__item team-clickable" type="button" onClick={() => navigate({ to: "/org-extracurricular" })}>Мероприятия</button>
                            <button className="team-tabs__item team-tabs__item--active team-clickable" type="button">Команды</button>
                            <button className="team-tabs__item team-clickable" type="button">Рейтинг</button>
                        </nav>
                    </div>
                </header>

                <div className="team-create-row">
                    <button className="team-primary-button team-clickable" type="button" onClick={() => navigate({ to: "/team-creation" })}>
                        Создать команду
                    </button>
                </div>

                <section className="team-list" aria-label="Команды">
                {isMainPanelVisible && (
                <section className={`team-panel team-panel--main team-list-panel${isPanelCollapsed ? " team-panel--collapsed" : ""}`}>
                    <div className="team-panel__head">
                        <div className="team-panel__icon team-panel__icon--violet">Н</div>
                        <div>
                            <h2>Название команды</h2>
                            <p>{getMembersLabel(members.length)} | 200 баллов</p>
                        </div>
                        <div className="team-panel__actions">
                            {isPanelCollapsed ? (
                                <>
                                    <button className="team-primary-button team-clickable" type="button" onClick={() => {
                                        setIsPanelCollapsed(false);
                                        setIsMainActionsHidden(false);
                                    }}>
                                        Редактировать
                                    </button>
                                    <button className="team-icon-button team-clickable" type="button" aria-label="Развернуть" onClick={() => setIsPanelCollapsed(false)}>
                                        <img src="/Button-down.svg" alt="" />
                                    </button>
                                </>
                            ) : isMainActionsHidden ? (
                                <button className="team-icon-button team-clickable" type="button" aria-label="Свернуть" onClick={() => setIsPanelCollapsed(true)}>
                                    <img src="/Button.svg" alt="" />
                                </button>
                            ) : (
                                <>
                                    <button className="team-danger-button team-clickable" type="button" onClick={() => setIsMainPanelVisible(false)}>
                                        Удалить
                                    </button>
                                    <button className="team-primary-button team-clickable" type="button" onClick={() => {
                                        setNotice("Изменения сохранены");
                                        setIsMainActionsHidden(true);
                                        setIsPanelCollapsed(true);
                                    }}>
                                        Сохранить
                                    </button>
                                    <button className="team-icon-button team-clickable" type="button" aria-label="Свернуть" onClick={() => setIsPanelCollapsed(true)}>
                                        <img src="/Button.svg" alt="" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {!isPanelCollapsed && (
                        <>
                            <div className="team-tools">
                                <div className="team-search">
                                    <input value={query} placeholder="Поиск участников" onChange={(event) => setQuery(event.target.value)} />
                                </div>
                                <div className="team-tools__actions">
                                </div>
                            </div>

                            <div className="team-table" role="table" aria-label="Участники">
                                <div className="team-table__header" role="row">
                                    <span>Участники</span>

                                    <span />
                                    <span />
                                </div>
                                <div className="team-table__body">
                                    {filteredMembers.map((member, index) => (
                                        <button
                                            className={`team-member-row team-clickable${activeMemberId === member.id ? " team-member-row--active" : ""}`}
                                            type="button"
                                            key={member.id}
                                            onClick={() => setActiveMemberId(member.id)}
                                        >
                                            <span className="team-member-row__person">
                                                <span className="team-member-row__avatar" style={{ background: memberColors[index % memberColors.length] }}>{member.name[0]}</span>
                                                <span>{member.name}</span>
                                            </span>
                                            <span className="team-status-placeholder" />
                                            {!isMainActionsHidden && (
                                                <span
                                                    className="team-member-row__remove"
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={`Удалить ${member.name}`}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setMembers((items) => items.filter((item) => item.id !== member.id));
                                                        setNotice("Участник удален");
                                                    }}
                                                >
                                                    ×
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </section>
                )}

                    {teamItems.map((team) => {
                        const collapsed = collapsedTeamIds.includes(team.id);
                        const actionsHidden = hiddenActionTeamIds.includes(team.id);
                        const currentTeamMembers = getTeamMembers(team);
                        const teamMembers = currentTeamMembers
                            .filter((member) => member.toLowerCase().includes(query.trim().toLowerCase()))
                            .map((member, index) => ({ id: index + 1, name: member }));

                        return (
                            <section className={`team-panel team-panel--main team-list-panel${collapsed ? " team-panel--collapsed" : ""}`} key={team.id}>
                                <div className="team-panel__head">
                                    <div className="team-panel__icon" style={{ background: team.color }}>К</div>
                                    <div>
                                        <h2>{team.title}</h2>
                                        <p>{getMembersLabel(currentTeamMembers.length)} | {team.points ?? 200} баллов</p>
                                    </div>
                                    <div className="team-panel__actions">
                                        {collapsed ? (
                                            <>
                                                <button className="team-primary-button team-clickable" type="button" onClick={() => toggleTeamPanel(team.id)}>
                                                    Редактировать
                                                </button>
                                                <button className="team-icon-button team-clickable" type="button" aria-label="Развернуть" onClick={() => toggleTeamPanel(team.id)}>
                                                    <img src="/Button-down.svg" alt="" />
                                                </button>
                                            </>
                                        ) : actionsHidden ? (
                                            <button className="team-icon-button team-clickable" type="button" aria-label="Свернуть" onClick={() => toggleTeamPanel(team.id)}>
                                                <img src="/Button.svg" alt="" />
                                            </button>
                                        ) : (
                                            <>
                                                <button className="team-danger-button team-clickable" type="button" onClick={() => deleteTeam(team.id)}>
                                                    Удалить
                                                </button>
                                                <button className="team-primary-button team-clickable" type="button" onClick={() => {
                                                    saveTeams();
                                                    hideTeamActions(team.id);
                                                    toggleTeamPanel(team.id);
                                                }}>
                                                    Сохранить
                                                </button>
                                                <button className="team-icon-button team-clickable" type="button" aria-label="Свернуть" onClick={() => toggleTeamPanel(team.id)}>
                                                    <img src="/Button.svg" alt="" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {!collapsed && (
                                    <>
                                        <div className="team-tools">
                                            <div className="team-search">
                                                <input value={query} placeholder="Поиск участников" onChange={(event) => setQuery(event.target.value)} />
                                            </div>
                                            <div className="team-tools__actions">
                                            </div>
                                        </div>

                                        <div className="team-table" role="table" aria-label={`Участники ${team.title}`}>
                                            <div className="team-table__header" role="row">
                                                <span>Участники</span>
                                                <span />
                                                <span />
                                            </div>
                                            <div className="team-table__body">
                                                {teamMembers.map((member, index) => (
                                                    <button
                                                        className={`team-member-row team-clickable${activeMemberId === member.id ? " team-member-row--active" : ""}`}
                                                        type="button"
                                                        key={`${team.id}-${member.id}`}
                                                        onClick={() => setActiveMemberId(member.id)}
                                                    >
                                                        <span className="team-member-row__person">
                                                            <span className="team-member-row__avatar" style={{ background: memberColors[index % memberColors.length] }}>{member.name[0]}</span>
                                                            <span>{member.name}</span>
                                                        </span>
                                                        <span className="team-status-placeholder" />
                                                        {!actionsHidden && (
                                                            <span
                                                                className="team-member-row__remove"
                                                                role="button"
                                                                tabIndex={0}
                                                                aria-label={`Удалить ${member.name}`}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    removeTeamMember(team.id, member.name);
                                                                }}
                                                            >
                                                                ×
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>
                        );
                    })}
                </section>
            </section>

            {isModalOpen && (
                <div className="team-modal" role="dialog" aria-modal="true" aria-label="Создать команду">
                    <div className="team-modal__card">
                        <h2>Создать команду</h2>
                        <input placeholder="Название команды" />
                        <input placeholder="Направление" />
                        <div className="team-modal__actions">
                            <button className="team-light-button team-clickable" type="button" onClick={() => setIsModalOpen(false)}>
                                Отмена
                            </button>
                            <button
                                className="team-primary-button team-clickable"
                                type="button"
                                onClick={() => {
                                    setNotice("Команда создана");
                                    setIsModalOpen(false);
                                }}
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
