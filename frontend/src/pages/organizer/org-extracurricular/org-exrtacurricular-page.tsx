import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
const organizers = ["А. И. Смирнова", "И. О. Петров", "М. С. Волкова", "Е. А. Морозова", "Д. Р. Ким"];
const participants = ["Иван Алексеев", "Мария Соколова", "Андрей Петров", "Ева Морозова", "Дмитрий Волков", "Анна Орлова"];

const formatPersonName = (name: string) => {
    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length >= 3 && parts[0].includes(".")) {
        return `${parts[2]} ${parts[0]}`;
    }

    return `${parts[1] ?? parts[0]} ${parts[0]?.[0] ?? ""}.`;
};

export function OrgExtracurricularPage() {
    const navigate = useNavigate();
    const sidebarAvatarSrc = localStorage.getItem("orgProfileAvatar") ?? "/teacher/profile/avatar-profile.png";
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [organizer, setOrganizer] = useState("");
    const [isOrganizerListOpen, setIsOrganizerListOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(["Проекты", "Медиа"]);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(["Иван Алексеев", "Мария Соколова"]);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
    const [schedule, setSchedule] = useState(initialSchedule);
    const [activeScheduleId, setActiveScheduleId] = useState(initialSchedule[0].id);

    const selectedCount = useMemo(() => selectedCategories.length, [selectedCategories]);
    const filteredOrganizers = useMemo(() => {
        const value = organizer.trim().toLowerCase();

        if (!value) {
            return organizers;
        }

        return organizers.filter((item) => item.toLowerCase().includes(value));
    }, [organizer]);

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

    const saveEvent = () => {
        const savedActivities = JSON.parse(localStorage.getItem("orgExtracurricularActivities") ?? "[]");

        localStorage.setItem(
            "orgExtracurricularActivities",
            JSON.stringify([
                ...savedActivities,
                {
                    id: Date.now(),
                    title: title || "Новая активность",
                    date: date || "18 июня",
                    time: time || "10:00",
                    organizer: organizer || "Анна Смирнова",
                    email: "organizer@sigma.ru",
                    attendanceSet: false,
                    status: "draft",
                    description,
                    categories: selectedCategories,
                    participants: selectedParticipants,
                    schedule,
                },
            ]),
        );
        navigate({ to: "/org-extracurricular" });
    };

    return (
        <main className="org-extra-page" aria-label="Создание активности">
            <aside className="org-extra-sidebar" aria-label="Навигация">
                <img className="org-extra-sidebar__reference" src="/sidebar-navigation.svg" alt="" aria-hidden="true" />
                <img className="org-extra-sidebar__avatar" src={sidebarAvatarSrc} alt="" aria-hidden="true" />
                <button className="org-extra-sidebar__hotspot org-extra-sidebar__hotspot--logo org-extra-clickable" type="button" aria-label="Главная" />
                <button className="org-extra-sidebar__hotspot org-extra-sidebar__hotspot--users org-extra-clickable" type="button" aria-label="Участники" />
                <button className="org-extra-sidebar__hotspot org-extra-sidebar__hotspot--calendar org-extra-clickable" type="button" aria-label="Мероприятия" />
                <button className="org-extra-sidebar__hotspot org-extra-sidebar__hotspot--courses org-extra-clickable" type="button" aria-label="Курсы" />
                <button className="org-extra-sidebar__hotspot org-extra-sidebar__hotspot--teams org-extra-clickable" type="button" aria-label="Команды" />
                <button className="org-extra-sidebar__hotspot org-extra-sidebar__hotspot--settings org-extra-clickable" type="button" aria-label="Настройки" />
                <button className="org-extra-sidebar__hotspot org-extra-sidebar__hotspot--profile org-extra-clickable" type="button" aria-label="Профиль" onClick={() => navigate({ to: "/org-profile" })} />
            </aside>

            <section className="org-extra-workspace">
                <header className="org-extra-header">
                    <div className="org-extra-header__left">
                        <h1>Создание активности</h1>
                        <p>Заполните данные для нового мероприятия или команды</p>
                    </div>
                    <div className="org-extra-header__actions">
                        <button className="org-extra-light-button org-extra-clickable" type="button" onClick={() => navigate({ to: "/org-extracurricular" })}>
                            Отмена
                        </button>
                        <button className="org-extra-primary-button org-extra-clickable" type="button" onClick={saveEvent}>
                            Сохранить
                        </button>
                    </div>
                </header>

                <section className="org-extra-layout">
                    <form className="org-extra-form" aria-label="Параметры внеучебки" onSubmit={(event) => event.preventDefault()}>
                        <div className="org-extra-card org-extra-card--main">

                            <label className="org-extra-field">
                                <span>Название активности</span>
                                <input value={title} placeholder="Например: Научный квиз" onChange={(event) => setTitle(event.target.value)} />
                            </label>

                            <div className="org-extra-grid">
                                <label className="org-extra-field">
                                    <span>Дата</span>
                                    <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                                </label>
                                <label className="org-extra-field">
                                    <span>Время</span>
                                    <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
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
                                    {isOrganizerListOpen && organizer !== filteredOrganizers.find((item) => item === organizer) && (
                                        <div className="org-extra-search-list" aria-label="Организаторы">
                                            {filteredOrganizers.map((item) => (
                                                <button
                                                    className="org-extra-search-item org-extra-clickable"
                                                    type="button"
                                                    key={item}
                                                    onClick={() => {
                                                        setOrganizer(formatPersonName(item));
                                                        setIsOrganizerListOpen(false);
                                                    }}
                                                >
                                                    {formatPersonName(item)}
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
                                <div className="org-extra-participants__head">
                                    <span>Участники / Состав команды</span>
                                    <button className="org-extra-add-list-button org-extra-clickable" type="button" aria-label="Добавить из списка" onClick={() => setIsParticipantsOpen((value) => !value)}>
                                        <img src="/Button-add-from-list.svg" alt="" />
                                    </button>
                                </div>
                                <div className="org-extra-member-tags" aria-label="Участники команды">
                                    {selectedParticipants.map((participant) => (
                                        <button className="org-extra-member-tag org-extra-clickable" type="button" key={participant} onClick={() => removeParticipant(participant)}>
                                            {formatPersonName(participant)}
                                            <span className="org-extra-member-tag__remove">×</span>
                                        </button>
                                    ))}
                                </div>
                                {isParticipantsOpen && (
                                    <div className="org-extra-participants-list" aria-label="Список участников">
                                        {participants.map((participant) => (
                                            <button
                                                className={`org-extra-participant-row org-extra-clickable${selectedParticipants.includes(participant) ? " org-extra-participant-row--selected" : ""}`}
                                                type="button"
                                                key={participant}
                                                onClick={() => (selectedParticipants.includes(participant) ? removeParticipant(participant) : addParticipant(participant))}
                                            >
                                                {formatPersonName(participant)}
                                                <span>{selectedParticipants.includes(participant) ? "×" : "+"}</span>
                                            </button>
                                        ))}
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
