import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./org-extracurricular.css";

type ActivityStatus = "active" | "draft" | "done";

type Activity = {
    id: number;
    title: string;
    date: string;
    time: string;
    organizer: string;
    email: string;
    attendanceSet: boolean;
    status: ActivityStatus;
};

const initialActivities: Activity[] = [
    { id: 1, title: "Название", date: "18 июня, 2026", time: "10:00", organizer: "Анна Смирнова", email: "smirnova@sigma.ru", attendanceSet: true, status: "active" },
    { id: 2, title: "Название", date: "21 июня, 2026", time: "13:30", organizer: "Иван Петров", email: "petrov@sigma.ru", attendanceSet: false, status: "draft" },
    { id: 3, title: "Название", date: "25 июня, 2026", time: "12:00", organizer: "Мария Волкова", email: "volkova@sigma.ru", attendanceSet: true, status: "active" },
    { id: 4, title: "Название", date: "30 июня, 2026", time: "09:30", organizer: "Ева Морозова", email: "morozova@sigma.ru", attendanceSet: false, status: "done" },
];

const formatActivityDate = (date: string) => {
    if (date.includes(",")) {
        return date;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const value = new Date(`${date}T00:00:00`);
        return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(value).replace(" г.", "");
    }

    return `${date}, 2026`;
};

const getInitialActivities = () => {
    const savedActivities = JSON.parse(localStorage.getItem("orgExtracurricularActivities") ?? "[]") as Activity[];

    return [...initialActivities, ...savedActivities];
};

const statusLabels: Record<ActivityStatus, string> = {
    active: "Опубликовано",
    draft: "Черновик",
    done: "Завершено",
};

export function OrgExtracurricularManagementPage() {
    const navigate = useNavigate();
    const sidebarAvatarSrc = localStorage.getItem("orgProfileAvatar") ?? "/teacher/profile/avatar-profile.png";
    const [activities, setActivities] = useState<Activity[]>(getInitialActivities);
    const [query, setQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState<ActivityStatus | "all">("all");
    const [selectedActivityId, setSelectedActivityId] = useState(getInitialActivities()[0].id);

    const filteredActivities = useMemo(() => {
        const value = query.trim().toLowerCase();

        return activities.filter((activity) => {
            const matchesStatus = activeStatus === "all" || activity.status === activeStatus;
            const matchesQuery = !value || activity.title.toLowerCase().includes(value) || activity.organizer.toLowerCase().includes(value);

            return matchesStatus && matchesQuery;
        });
    }, [activities, activeStatus, query]);

    const deleteActivity = (id: number) => {
        const nextActivities = activities.filter((activity) => activity.id !== id);

        setActivities(nextActivities);
        setSelectedActivityId(nextActivities[0]?.id ?? 0);
    };

    const togglePublish = (id: number) => {
        setActivities((items) =>
            items.map((activity) =>
                activity.id === id
                    ? {
                        ...activity,
                        status: activity.status === "draft" ? "active" : "draft",
                    }
                    : activity,
            ),
        );
    };

    return (
        <main className="org-extracurricular-page" aria-label="Внеучебка">
            <aside className="org-sidebar" aria-label="Навигация">
                <img className="org-sidebar__reference" src="/sidebar-navigation.svg" alt="" aria-hidden="true" />
                <img className="org-sidebar__avatar" src={sidebarAvatarSrc} alt="" aria-hidden="true" />
                <button className="org-sidebar__hotspot org-sidebar__hotspot--logo org-clickable" type="button" aria-label="Главная" />
                <button className="org-sidebar__hotspot org-sidebar__hotspot--users org-clickable" type="button" aria-label="Участники" />
                <button className="org-sidebar__hotspot org-sidebar__hotspot--calendar org-clickable" type="button" aria-label="Мероприятия" />
                <button className="org-sidebar__hotspot org-sidebar__hotspot--courses org-clickable" type="button" aria-label="Курсы" />
                <button className="org-sidebar__hotspot org-sidebar__hotspot--teams org-clickable" type="button" aria-label="Команды" />
                <button className="org-sidebar__hotspot org-sidebar__hotspot--settings org-clickable" type="button" aria-label="Настройки" />
                <button className="org-sidebar__hotspot org-sidebar__hotspot--profile org-clickable" type="button" aria-label="Профиль" onClick={() => navigate({ to: "/org-profile" })} />
            </aside>

            <section className="org-workspace">
                <header className="org-header">
                    <div className="org-header__left">
                        <h1>Внеучебная деятельность</h1>
                        <p>Управление мероприятиями, командами и баллами</p>
                        <nav className="org-tabs" aria-label="Разделы внеучебки">
                            <button className="org-tabs__item org-tabs__item--active org-clickable" type="button">Мероприятия</button>
                            <button className="org-tabs__item org-clickable" type="button" onClick={() => navigate({ to: "/team-formation" })}>Команды</button>
                            <button className="org-tabs__item org-clickable" type="button">Рейтинг</button>
                        </nav>
                    </div>
                </header>

                <div className="org-create-row">
                    <button className="org-primary-button org-clickable" type="button" onClick={() => navigate({ to: "/org-extracurricular-creation" })}>
                        Создать мероприятие
                    </button>
                </div>

                <section className="org-content">
                    <section className="org-panel org-panel--main">
                        <div className="org-table" role="table" aria-label="Список мероприятий">
                            <div className="org-table__header" role="row">
                                <span>Название</span>
                                <span>Дата</span>
                                <span>Время</span>
                                <span>Организатор</span>
                                <span>Кабинет</span>
                                <span>Выставить посещаемость</span>
                            </div>
                            <div className="org-table__body">
                                {filteredActivities.map((activity) => (
                                    <button
                                        className={`org-activity-row org-clickable${selectedActivityId === activity.id ? " org-activity-row--active" : ""}`}
                                        type="button"
                                        key={activity.id}
                                        onClick={() => {
                                            setSelectedActivityId(activity.id);
                                            navigate({
                                                to: "/extracurricular-points-add",
                                                search: {
                                                    title: activity.title,
                                                    date: activity.date,
                                                    time: activity.time,
                                                    organizer: activity.organizer,
                                                },
                                            });
                                        }}
                                    >
                                        <span className="org-activity-row__title">{activity.title}</span>
                                        <span>{formatActivityDate(activity.date)}</span>
                                        <span>{activity.time}</span>
                                        <span className="org-organizer-cell">
                                            <strong>{activity.organizer}</strong>
                                            <small>{activity.email}</small>
                                        </span>
                                        <span>1203</span>
                                        <span
                                            className={`org-attendance-action org-clickable${activity.attendanceSet ? " org-attendance-action--set" : ""}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setActivities((items) =>
                                                    items.map((item) =>
                                                        item.id === activity.id ? { ...item, attendanceSet: true } : item,
                                                    ),
                                                );
                                            }}
                                        >
                                            {activity.attendanceSet ? "Изменить" : "Выставить"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </section>
            </section>
        </main>
    );
}
