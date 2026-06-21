import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthApiError, getAuthSession } from "../../../entities/auth";
import {
    createExtracurricularActivity,
    DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE,
} from "../../../entities/organizer/api/extracurricular.api";
import { getSeasonStaff, getSeasonStudents } from "../../../entities/organizer/api/season.api";
import type { SeasonStaffMember, SeasonStudent } from "../../../entities/organizer/model/season.types";
import { DEFAULT_SEASON_ID } from "../../../features/auth/student-registration";
import {
    extractActivityDateDigits,
    extractActivityTimeDigits,
    formatActivityDateDigits,
    formatActivityTimeDigits,
    validateActivityDate,
    validateActivityDateLive,
    validateActivityTime,
    validateActivityTimeLive,
} from "../../../features/organizer/activity-schedule-validation";
import { OrgSidebar } from "../../../widgets/org-sidebar";
import "../../../styles/field-error.css";
import "./org-extracurricular-page.css";

type EventFormat = "offline" | "online";

type ScheduleItem = {
    id: number;
    time: string;
    title: string;
    speaker: string;
};

const initialSchedule: ScheduleItem[] = [
    { id: 1, time: "10:00", title: "Открытие и регистрация", speaker: "Оргкомитет" },
    { id: 2, time: "11:30", title: "Практический блок", speaker: "Куратор направления" },
    { id: 3, time: "14:00", title: "Командная работа", speaker: "Наставники" },
];

const categories = ["Волонтерство", "Медиа", "Спорт", "Проекты", "Дизайн", "Наука"];

const formatStaffLabel = (staff: SeasonStaffMember) =>
    `${staff.last_name} ${staff.first_name[0] ?? ""}.`.trim();

const formatStudentLabel = (student: SeasonStudent) =>
    `${student.first_name} ${student.last_name}`.trim();

const formatPersonName = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length >= 3 && parts[0].includes(".")) {
        return `${parts[2]} ${parts[0]}`;
    }

    return `${parts[1] ?? parts[0]} ${parts[0]?.[0] ?? ""}.`;
};

function FieldErrorMessage({ id, message }: { id?: string; message?: string | null }) {
    if (!message) {
        return null;
    }

    return (
        <p className="field-error" id={id}>
            {message}
        </p>
    );
}

export function OrgExtracurricularCreationPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dateDigits, setDateDigits] = useState("");
    const [timeDigits, setTimeDigits] = useState("");
    const [dateError, setDateError] = useState<string | null>(null);
    const [timeError, setTimeError] = useState<string | null>(null);
    const [organizer, setOrganizer] = useState("");
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const [staffMembers, setStaffMembers] = useState<SeasonStaffMember[]>([]);
    const [students, setStudents] = useState<SeasonStudent[]>([]);
    const [isOrganizerListOpen, setIsOrganizerListOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(["Проекты", "Медиа"]);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [schedule, setSchedule] = useState(initialSchedule);
    const [activeScheduleId, setActiveScheduleId] = useState(initialSchedule[0].id);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const loadReferenceData = useCallback(async () => {
        try {
            const [staff, seasonStudents] = await Promise.all([
                getSeasonStaff(DEFAULT_SEASON_ID),
                getSeasonStudents(DEFAULT_SEASON_ID),
            ]);
            setStaffMembers(staff);
            setStudents(seasonStudents);

            const session = getAuthSession();
            const currentStaff = staff.find((member) => member.id === session?.userId);
            if (currentStaff) {
                setOrganizer(formatStaffLabel(currentStaff));
                setSelectedStaffId(currentStaff.id);
            }
        } catch {
            setStaffMembers([]);
            setStudents([]);
        }
    }, []);

    useEffect(() => {
        void loadReferenceData();
    }, [loadReferenceData]);

    const selectedCount = useMemo(() => selectedCategories.length, [selectedCategories]);
    const filteredOrganizers = useMemo(() => {
        const value = organizer.trim().toLowerCase();

        if (!value) {
            return staffMembers;
        }

        return staffMembers.filter((item) => formatStaffLabel(item).toLowerCase().includes(value));
    }, [organizer, staffMembers]);

    const toggleCategory = (category: string) => {
        setSelectedCategories((items) =>
            items.includes(category) ? items.filter((item) => item !== category) : [...items, category],
        );
    };

    const addScheduleItem = () => {
        const nextId = Math.max(...schedule.map((item) => item.id), 0) + 1;
        const nextItem = {
            id: nextId,
            time: "15:00",
            title: "Новый блок программы",
            speaker: "Ответственный",
        };

        setSchedule((items) => [...items, nextItem]);
        setActiveScheduleId(nextId);
    };

    const removeScheduleItem = (id: number) => {
        const nextSchedule = schedule.filter((item) => item.id !== id);

        setSchedule(nextSchedule);
        setActiveScheduleId(nextSchedule[0]?.id ?? 0);
    };

    const addParticipant = (participant: string) => {
        setSelectedParticipants((items) => (items.includes(participant) ? items : [...items, participant]));
    };

    const removeParticipant = (participant: string) => {
        setSelectedParticipants((items) => items.filter((item) => item !== participant));
    };

    const saveEvent = async () => {
        const nextDateError = validateActivityDate(dateDigits);
        const nextTimeError = validateActivityTime(timeDigits);

        setDateError(nextDateError);
        setTimeError(nextTimeError);
        setSaveError(null);

        if (nextDateError || nextTimeError) {
            return;
        }

        const session = getAuthSession();
        const staffId = selectedStaffId ?? session?.userId;
        if (!staffId) {
            setSaveError("Не удалось определить ответственного организатора");
            return;
        }

        setIsSaving(true);

        try {
            await createExtracurricularActivity({
                ex_course_name: title.trim() || "Новая активность",
                staff_id: staffId,
                ex_course_score: DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE,
                season_id: DEFAULT_SEASON_ID,
            });
            navigate({ to: "/org-extracurricular" });
        } catch (error) {
            if (error instanceof AuthApiError) {
                setSaveError(error.message);
            } else {
                setSaveError("Не удалось создать мероприятие");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="org-layout org-extra-page" aria-label="Создание активности">
            <OrgSidebar />

            <section className="org-layout__workspace org-extra-workspace">
                <header className="org-extra-header">
                    <div className="org-extra-header__left">
                        <h1>Создание активности</h1>
                        <p>Заполните данные для нового мероприятия или команды</p>
                    </div>
                    <div className="org-extra-header__actions">
                        <button className="org-extra-light-button org-extra-clickable" type="button" onClick={() => navigate({ to: "/org-extracurricular" })}>
                            Отмена
                        </button>
                        <button className="org-extra-primary-button org-extra-clickable" type="button" onClick={() => void saveEvent()} disabled={isSaving}>
                            {isSaving ? "Сохранение..." : "Сохранить"}
                        </button>
                    </div>
                </header>

                <section className="org-extra-layout">
                    {saveError ? <p className="field-error">{saveError}</p> : null}
                    <form className="org-extra-form" aria-label="Параметры внеучебки" onSubmit={(event) => event.preventDefault()}>
                        <div className="org-extra-card org-extra-card--main">

                            <label className="org-extra-field">
                                <span>Название активности</span>
                                <input value={title} placeholder="Например: Научный квиз" onChange={(event) => setTitle(event.target.value)} />
                            </label>

                            <div className="org-extra-grid">
                                <label className="org-extra-field">
                                    <span>Дата</span>
                                    <input
                                        className={`org-extra-field__schedule-input${dateError ? " field-input--error" : ""}`}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        value={formatActivityDateDigits(dateDigits)}
                                        placeholder="ДД.ММ.ГГ"
                                        aria-invalid={dateError ? "true" : "false"}
                                        aria-describedby={dateError ? "org-extra-date-error" : undefined}
                                        onChange={(event) => {
                                            const nextDigits = extractActivityDateDigits(event.target.value);
                                            setDateDigits(nextDigits);
                                            setDateError(validateActivityDateLive(nextDigits));
                                        }}
                                        onBlur={() => setDateError(validateActivityDate(dateDigits))}
                                    />
                                    <FieldErrorMessage id="org-extra-date-error" message={dateError} />
                                </label>
                                <label className="org-extra-field">
                                    <span>Время</span>
                                    <input
                                        className={`org-extra-field__schedule-input${timeError ? " field-input--error" : ""}`}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        value={formatActivityTimeDigits(timeDigits)}
                                        placeholder="ЧЧ:ММ"
                                        aria-invalid={timeError ? "true" : "false"}
                                        aria-describedby={timeError ? "org-extra-time-error" : undefined}
                                        onChange={(event) => {
                                            const nextDigits = extractActivityTimeDigits(event.target.value);
                                            setTimeDigits(nextDigits);
                                            setTimeError(validateActivityTimeLive(nextDigits));
                                        }}
                                        onBlur={() => setTimeError(validateActivityTime(timeDigits))}
                                    />
                                    <FieldErrorMessage id="org-extra-time-error" message={timeError} />
                                </label>
                                <label className="org-extra-field">
                                    <span>Ответственный организатор</span>
                                    <input
                                        value={organizer}
                                        placeholder="Введите Фамилия И."
                                        onFocus={() => setIsOrganizerListOpen(true)}
                                        onChange={(event) => {
                                            setOrganizer(event.target.value);
                                            setIsOrganizerListOpen(true);
                                        }}
                                    />
                                    {isOrganizerListOpen && (
                                        <div className="org-extra-search-list" aria-label="Организаторы">
                                            {filteredOrganizers.map((item) => (
                                                <button
                                                    className="org-extra-search-item org-extra-clickable"
                                                    type="button"
                                                    key={item.id}
                                                    onClick={() => {
                                                        setOrganizer(formatStaffLabel(item));
                                                        setSelectedStaffId(item.id);
                                                        setIsOrganizerListOpen(false);
                                                    }}
                                                >
                                                    {formatStaffLabel(item)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </label>
                            </div>

                            <label className="org-extra-field">
                                <span>Описание / Локация</span>
                                <textarea value={description} placeholder="Краткое описание активности и место проведения..." onChange={(event) => setDescription(event.target.value)} />
                            </label>
                            
                            <section className="org-extra-participants" aria-label="Участники / Состав команды">
                                <span className="org-extra-participants__title">Участники / Состав команды</span>
                                <div className="org-extra-participants__toolbar">
                                <div className="org-extra-member-tags" aria-label="Участники команды">
                                    {selectedParticipants.map((participant) => (
                                        <button className="org-extra-member-tag org-extra-clickable" type="button" key={participant} onClick={() => removeParticipant(participant)}>
                                            {formatPersonName(participant)}
                                            <span className="org-extra-member-tag__remove">×</span>
                                        </button>
                                    ))}
                                </div>
                                    <button
                                        className="org-extra-add-list-button org-extra-clickable"
                                        type="button"
                                        aria-label="Добавить из списка"
                                        aria-expanded={isParticipantsOpen}
                                        onClick={() => setIsParticipantsOpen((value) => !value)}
                                    >
                                        + Добавить из списка
                                    </button>
                                </div>
                                {isParticipantsOpen && (
                                    <div className="org-extra-participants-list" aria-label="Список участников">
                                        {students.map((participant) => {
                                            const label = formatStudentLabel(participant);
                                            return (
                                            <button
                                                className={`org-extra-participant-row org-extra-clickable${selectedParticipants.includes(label) ? " org-extra-participant-row--selected" : ""}`}
                                                type="button"
                                                key={participant.id}
                                                onClick={() => (selectedParticipants.includes(label) ? removeParticipant(label) : addParticipant(label))}
                                            >
                                                {formatPersonName(label)}
                                                <span>{selectedParticipants.includes(label) ? "×" : "+"}</span>
                                            </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>
                    </form>
                </section>
            </section>
        </main>
    );
}
