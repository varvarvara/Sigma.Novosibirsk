import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthApiError } from "../../../api/auth";
import {
    addExtracurricularTeamMember,
    createExtracurricularTeam,
    listExtracurricularTeams,
} from "../../../api/organizer/extracurricular";
import { getSeasonStudents, type SeasonStudent } from "../../../api/organizer/season";
import { DEFAULT_SEASON_ID } from "../../../features/auth/student-registration";
import { OrgSidebar } from "../../../shared/ui/org-sidebar";
import "./team-creation-page.css";

function formatStudentName(student: SeasonStudent) {
    return `${student.first_name} ${student.last_name}`.trim();
}

function formatMemberName(name: string) {
    const [firstName = "", lastName = ""] = name.split(" ");

    if (!lastName) {
        return firstName;
    }

    return `${lastName} ${firstName[0]}.`;
}

export function TeamCreationPage() {
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState("");
    const [memberIds, setMemberIds] = useState<number[]>([]);
    const [memberName, setMemberName] = useState("");
    const [students, setStudents] = useState<SeasonStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStudents = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const seasonStudents = await getSeasonStudents(DEFAULT_SEASON_ID);
            setStudents(seasonStudents);
        } catch (loadError) {
            if (loadError instanceof AuthApiError) {
                setError(loadError.message);
            } else {
                setError("Не удалось загрузить участников");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadStudents();
    }, [loadStudents]);

    const selectedMembers = useMemo(
        () => students.filter((student) => memberIds.includes(student.id)),
        [memberIds, students],
    );

    const filteredCandidates = useMemo(() => {
        const query = memberName.trim().toLowerCase();

        return students.filter((candidate) => {
            if (!query) {
                return true;
            }

            return formatStudentName(candidate).toLowerCase().includes(query);
        });
    }, [memberName, students]);

    const addMember = (student: SeasonStudent) => {
        setMemberIds((items) => (items.includes(student.id) ? items : [...items, student.id]));
        setMemberName("");
    };

    const createTeam = async () => {
        const trimmedName = teamName.trim() || "Название команды";
        setIsSaving(true);
        setError(null);

        try {
            const existingTeams = await listExtracurricularTeams();
            const nextTeamNumber =
                existingTeams.reduce((max, team) => Math.max(max, team.ex_team_number), 0) + 1;

            const createdTeam = await createExtracurricularTeam({
                ex_team_number: nextTeamNumber,
                ex_team_name: trimmedName,
                season_id: DEFAULT_SEASON_ID,
            });

            await Promise.all(
                memberIds.map((studentId) =>
                    addExtracurricularTeamMember({
                        team_id: createdTeam.id,
                        student_id: studentId,
                        season_id: DEFAULT_SEASON_ID,
                    }),
                ),
            );

            navigate({ to: "/team-formation" });
        } catch (saveError) {
            if (saveError instanceof AuthApiError) {
                setError(saveError.message);
            } else {
                setError("Не удалось создать команду");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="org-layout team-creation-page" aria-label="Создание команды">
            <OrgSidebar />

            <section className="org-layout__workspace team-creation-workspace">
                <header className="team-creation-header">
                    <div className="team-creation-header__left">
                        <h1>Создание команды</h1>
                        <p>Заполните данные и выберите участников</p>
                    </div>
                    <div className="team-creation-header__actions">
                        <button className="team-creation-light-button team-creation-clickable" type="button" onClick={() => navigate({ to: "/team-formation" })}>
                            Отмена
                        </button>
                        <button
                            className="team-creation-primary-button team-creation-clickable"
                            type="button"
                            onClick={() => void createTeam()}
                            disabled={isSaving}
                        >
                            {isSaving ? "Создание..." : "Создать"}
                        </button>
                    </div>
                </header>

                {error ? <p className="team-creation-status">{error}</p> : null}
                {isLoading ? <p className="team-creation-status">Загрузка участников...</p> : null}

                <section className="team-creation-form" aria-label="Параметры команды">
                    <label className="team-creation-field">
                        <span>Название команды</span>
                        <input value={teamName} placeholder="Например: Сигма-тим" onChange={(event) => setTeamName(event.target.value)} />
                    </label>

                    <div className="team-creation-section-head">
                        <h2 className="team-creation-section-title">Выберите участников</h2>
                        <span>Добавлено: {selectedMembers.length}</span>
                    </div>

                    <div className="team-creation-tags" aria-label="Участники команды">
                        {selectedMembers.map((member) => (
                            <button
                                className="team-creation-tag team-creation-clickable"
                                type="button"
                                key={member.id}
                                onClick={() => setMemberIds((items) => items.filter((id) => id !== member.id))}
                            >
                                <span>{formatMemberName(formatStudentName(member))}</span>
                                <span className="team-creation-tag__remove">×</span>
                            </button>
                        ))}
                    </div>

                    <div className="team-creation-add-row">
                        <input value={memberName} placeholder="Введите ФИО участника" onChange={(event) => setMemberName(event.target.value)} />
                    </div>

                    <div className="team-creation-search-results" aria-label="Найденные участники">
                        {filteredCandidates.map((candidate) => (
                            <div className="team-creation-search-result" key={candidate.id}>
                                <span className="team-creation-search-result__person">
                                    {candidate.avatar_url ? (
                                        <img className="team-creation-search-result__avatar" src={candidate.avatar_url} alt="" />
                                    ) : (
                                        <span className="team-creation-search-result__avatar team-creation-search-result__avatar--fallback">
                                            {formatStudentName(candidate)[0]}
                                        </span>
                                    )}
                                    <span>{formatStudentName(candidate)}</span>
                                </span>
                                {memberIds.includes(candidate.id) ? (
                                    <button
                                        className="team-creation-remove team-creation-clickable"
                                        type="button"
                                        aria-label={`Удалить ${formatStudentName(candidate)}`}
                                        onClick={() => setMemberIds((items) => items.filter((id) => id !== candidate.id))}
                                    >
                                        ×
                                    </button>
                                ) : (
                                    <button
                                        className="team-creation-add-button team-creation-clickable"
                                        type="button"
                                        aria-label={`Добавить ${formatStudentName(candidate)}`}
                                        onClick={() => addMember(candidate)}
                                    >
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
