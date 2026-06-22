import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthApiError } from "../../../entities/auth";
import {
    useListActivitiesQuery,
    useListScoresQuery,
} from "../../../entities/organizer/queries/extracurricular.queries";
import { useSeasonStaffQuery } from "../../../entities/organizer/queries/season.queries";
import type { SeasonStaffMember } from "../../../entities/organizer/model/season.types";
import type { ExtracurricularActivity } from "../../../entities/organizer/model/extracurricular.types";
import { DEFAULT_SEASON_ID } from "../../../features/auth/student-registration";
import { OrgSidebar } from "../../../widgets/org-sidebar";
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

function mapActivity(
    activity: ExtracurricularActivity,
    staffById: Map<number, SeasonStaffMember>,
    scoredActivityIds: Set<number>,
): Activity {
    const staff = staffById.get(activity.staff_id);

    return {
        id: activity.id,
        title: activity.ex_course_name,
        date: "—",
        time: "—",
        organizer: staff ? `${staff.first_name} ${staff.last_name}` : "—",
        email: staff?.email ?? "—",
        attendanceSet: scoredActivityIds.has(activity.id),
        status: "active",
    };
}

export function OrgExtracurricularManagementPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState<ActivityStatus | "all">("all");
    const [selectedActivityId, setSelectedActivityId] = useState(0);
    const {
        data: apiActivities = [],
        isLoading: isActivitiesLoading,
        error: activitiesError,
    } = useListActivitiesQuery();
    const {
        data: scores = [],
        isLoading: isScoresLoading,
        error: scoresError,
    } = useListScoresQuery();
    const {
        data: staff = [],
        isLoading: isStaffLoading,
        error: staffError,
    } = useSeasonStaffQuery(DEFAULT_SEASON_ID);

    const isLoading = isActivitiesLoading || isScoresLoading || isStaffLoading;
    const error =
        activitiesError instanceof AuthApiError ? activitiesError.message :
        scoresError instanceof AuthApiError ? scoresError.message :
        staffError instanceof AuthApiError ? staffError.message :
        activitiesError || scoresError || staffError ? "Не удалось загрузить мероприятия" : null;

    const activities = useMemo(() => {
        const staffById = new Map(staff.map((member) => [member.id, member] as const));
        const scoredActivityIds = new Set(scores.map((score) => score.ex_course_id));

        return apiActivities.map((activity) =>
            mapActivity(activity, staffById, scoredActivityIds),
        );
    }, [apiActivities, scores, staff]);

    useEffect(() => {
        setSelectedActivityId((current) => current || activities[0]?.id || 0);
    }, [activities]);

    const filteredActivities = useMemo(() => {
        const value = query.trim().toLowerCase();

        return activities.filter((activity) => {
            const matchesStatus = activeStatus === "all" || activity.status === activeStatus;
            const matchesQuery =
                !value ||
                activity.title.toLowerCase().includes(value) ||
                activity.organizer.toLowerCase().includes(value);

            return matchesStatus && matchesQuery;
        });
    }, [activities, activeStatus, query]);

    return (
        <main className="org-layout org-extracurricular-page" aria-label="Внеучебка">
            <OrgSidebar />

            <section className="org-layout__workspace org-workspace">
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
                    <div className="org-header__actions">
                        <button className="org-primary-button org-clickable" type="button" onClick={() => navigate({ to: "/org-extracurricular-creation" })}>
                            Создать мероприятие
                        </button>
                    </div>
                </header>

                <div className="org-tools">
                    <label className="org-search">
                        <input
                            type="text"
                            value={query}
                            placeholder="Поиск по названию или организатору"
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </label>
                </div>

                <section className="org-content">
                    <section className="org-panel org-panel--main">
                        {isLoading ? <p className="org-extracurricular-status">Загрузка...</p> : null}
                        {error ? <p className="org-extracurricular-status">{error}</p> : null}
                        {!isLoading && !error && filteredActivities.length === 0 ? (
                            <p className="org-extracurricular-status">Мероприятий пока нет</p>
                        ) : null}
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
                                                    activityId: activity.id,
                                                    title: activity.title,
                                                    organizer: activity.organizer,
                                                },
                                            });
                                        }}
                                    >
                                        <span className="org-activity-row__title">{activity.title}</span>
                                        <span>{activity.date}</span>
                                        <span>{activity.time}</span>
                                        <span className="org-organizer-cell">
                                            <strong>{activity.organizer}</strong>
                                            <small>{activity.email}</small>
                                        </span>
                                        <span>—</span>
                                        <span
                                            className={`org-attendance-action org-clickable${activity.attendanceSet ? " org-attendance-action--set" : ""}`}
                                            role="button"
                                            tabIndex={0}
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
