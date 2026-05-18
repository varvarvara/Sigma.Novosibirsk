import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AuthApiError } from "../../../api/auth";
import {
    DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE,
    listExtracurricularActivities,
    listExtracurricularScores,
    listExtracurricularTeams,
    markExtracurricularTeamAttendance,
} from "../../../api/organizer/extracurricular";
import { DEFAULT_SEASON_ID } from "../../../features/auth/student-registration";
import { OrgSidebar } from "../../../shared/ui/org-sidebar";
import "./extracurricular-points-add.css";

type TeamScore = {
    id: number;
    name: string;
    points: number;
    visited: boolean;
};

const formatResponsible = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);

    return `${parts[1] ?? parts[0]} ${parts[0]?.[0] ?? ""}.`;
};

export function ExtracurricularPointsAddPage() {
    const navigate = useNavigate();
    const search = useSearch({ from: "/extracurricular-points-add" });
    const [teams, setTeams] = useState<TeamScore[]>([]);
    const [notice, setNotice] = useState("Черновик");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [defaultPoints, setDefaultPoints] = useState(DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE);

    const activityId = search.activityId;
    const title = search.title ?? "Название";
    const date = search.date ?? "—";
    const time = search.time ?? "—";
    const organizer = search.organizer ?? "—";

    const loadTeams = useCallback(async () => {
        if (!activityId) {
            setError("Не выбрано мероприятие");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [apiTeams, scores, activities] = await Promise.all([
                listExtracurricularTeams(),
                listExtracurricularScores(),
                listExtracurricularActivities(),
            ]);

            const activity = activities.find((item) => item.id === activityId);
            const activityScore = activity?.ex_course_score ?? DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE;
            setDefaultPoints(activityScore);

            const scoredTeamIds = new Set(
                scores
                    .filter((score) => score.ex_course_id === activityId)
                    .map((score) => score.team_id),
            );

            setTeams(
                apiTeams.map((team) => ({
                    id: team.id,
                    name: team.ex_team_name,
                    points: scoredTeamIds.has(team.id) ? activityScore : 0,
                    visited: scoredTeamIds.has(team.id),
                })),
            );
        } catch (loadError) {
            if (loadError instanceof AuthApiError) {
                setError(loadError.message);
            } else {
                setError("Не удалось загрузить команды");
            }
            setTeams([]);
        } finally {
            setIsLoading(false);
        }
    }, [activityId]);

    useEffect(() => {
        void loadTeams();
    }, [loadTeams]);

    const filteredTeams = teams;

    const updateTeam = (id: number, patch: Partial<TeamScore>) => {
        setTeams((items) => items.map((team) => (team.id === id ? { ...team, ...patch } : team)));
    };

    const savePoints = async () => {
        if (!activityId) {
            setNotice("Выберите мероприятие");
            return;
        }

        setIsSaving(true);
        setNotice("Сохранение...");

        try {
            const visitedTeams = teams.filter((team) => team.visited);

            await Promise.all(
                visitedTeams.map(async (team) => {
                    try {
                        await markExtracurricularTeamAttendance({
                            team_id: team.id,
                            ex_course_id: activityId,
                            season_id: DEFAULT_SEASON_ID,
                        });
                    } catch (saveError) {
                        if (saveError instanceof AuthApiError && saveError.status === 400) {
                            return;
                        }
                        throw saveError;
                    }
                }),
            );

            setNotice("Сохранено");
            navigate({ to: "/org-extracurricular" });
        } catch (saveError) {
            if (saveError instanceof AuthApiError) {
                setNotice(saveError.message);
            } else {
                setNotice("Не удалось сохранить посещаемость");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="org-layout points-add-page" aria-label="Начисление баллов">
            <OrgSidebar />

            <section className="org-layout__workspace points-workspace">
                <header className="points-header">
                    <button className="points-back-button points-clickable" type="button" aria-label="Назад" onClick={() => navigate({ to: "/org-extracurricular" })}>
                        <img src="/Back-Button.svg" alt="" />
                    </button>
                    <div className="points-header__left">
                        <h1>{title}</h1>
                        <p>{date} • {time} | Ответственный: {formatResponsible(organizer)}</p>
                        <nav className="points-tabs" aria-label="Разделы внеучебки">
                            <button className="points-tabs__item points-tabs__item--active points-clickable" type="button" onClick={() => navigate({ to: "/org-extracurricular" })}>Мероприятия</button>
                            <button className="points-tabs__item points-clickable" type="button" onClick={() => navigate({ to: "/team-formation" })}>Команды</button>
                            <button className="points-tabs__item points-clickable" type="button">Рейтинг</button>
                        </nav>
                    </div>
                    <div className="points-header__actions" />
                </header>

                <div className="points-tools">
                    <button
                        className="points-light-button points-clickable"
                        type="button"
                        onClick={() => void savePoints()}
                        disabled={isSaving || isLoading || !activityId}
                    >
                        {isSaving ? "Сохранение..." : "Сохранить посещаемость"}
                    </button>
                    {notice ? <span className="points-notice">{notice}</span> : null}
                </div>

                <section className="points-panel" aria-label="Начисление баллов">
                    {isLoading ? <p className="points-status">Загрузка...</p> : null}
                    {error ? <p className="points-status">{error}</p> : null}
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
                                        onClick={() =>
                                            updateTeam(team.id, {
                                                visited: !team.visited,
                                                points: team.visited ? 0 : defaultPoints,
                                            })
                                        }
                                        aria-label={team.visited ? "Присутствует" : "Отсутствует"}
                                    >
                                        <img src={team.visited ? "/present.svg" : "/absent.svg"} alt="" />
                                    </button>
                                    <input
                                        className="points-input"
                                        value={team.points}
                                        inputMode="numeric"
                                        readOnly
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
