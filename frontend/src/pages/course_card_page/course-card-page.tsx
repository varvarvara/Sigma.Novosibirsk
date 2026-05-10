import { Link, useSearch } from "@tanstack/react-router";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { Navbar } from "../../widgets/navbar/navbar";
import "./course-card-page.css";

type CourseType = "Авторский" | "Олимпиадный";

const lessonSlots = [
    { id: 1, title: "1 урок", time: "10:00 - 11:00" },
    { id: 2, title: "2 урок", time: "11:20 - 12:20" },
    { id: 3, title: "3 урок", time: "12:40 - 13:40" },
];

const courses = [
    {
        id: 101,
        title: "Название курса",
        teacher: "Преподаватель",
        type: "Олимпиадный" as CourseType,
        desc: "Описание: здесь должно быть очень-очень много текста, связанного с программой и материалами курса. Надеюсь, вам стало понятнее, зачем тут так много текста.",
        extraLines: ["Ещё-ещё-ещё текста", "И ещё текст"],
    },
    {
        id: 102,
        title: "Название курса",
        teacher: "Преподаватель",
        type: "Авторский" as CourseType,
        desc: "Описание: здесь должно быть очень-очень много текста, связанного с программой и материалами курса. Надеюсь, вам стало понятнее, зачем тут так много текста.",
        extraLines: ["Ещё-ещё-ещё текста", "И ещё текст"],
    },
    {
        id: 103,
        title: "Название курса",
        teacher: "Преподаватель",
        type: "Олимпиадный" as CourseType,
        desc: "Описание: здесь должно быть очень-очень много текста, связанного с программой и материалами курса. Надеюсь, вам стало понятнее, зачем тут так много текста.",
        extraLines: ["Ещё-ещё-ещё текста", "И ещё текст"],
    },
];

export function CourseCardPage() {
    const { slotId, courseId } = useSearch({ from: "/course-card" });
    const currentSlot = lessonSlots.find((slot) => slot.id === slotId) ?? lessonSlots[0];
    const currentCourse = courses.find((course) => course.id === courseId) ?? courses[0];

    return (
        <main className="course-card-page">
            <header className="course-card-header">
                <Link
                    className="course-card-header__back app-back-button app-back-button--dark"
                    to="/course-detail"
                    search={{ slotId }}
                    aria-label="Назад"
                >
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1 className="course-card-header__title">Выбор курсов</h1>
                <div className="course-card-header__meta">
                    <div className="course-card-header__date">23 июля - 30 июля</div>
                    <div className="course-card-header__lesson-time">
                        {currentSlot.title} | {currentSlot.time}
                    </div>
                </div>
            </header>

            <section className="course-card-content">
                <article className="course-card-item">
                    <div className="course-card-item__top">
                        <div className="course-card-item__title-group">
                            <h2>{currentCourse.title}</h2>
                            <span className="course-card-item__teacher">{currentCourse.teacher}</span>
                        </div>
                        <span
                            className={`course-card-item__badge ${
                                currentCourse.type === "Олимпиадный"
                                    ? "course-card-item__badge--olympiad"
                                    : "course-card-item__badge--author"
                            }`}
                        >
                            {currentCourse.type}
                        </span>
                    </div>

                    <p className="course-card-item__description">{currentCourse.desc}</p>

                    {currentCourse.extraLines.map((line) => (
                        <p key={line} className="course-card-item__extra-line">
                            {line}
                        </p>
                    ))}

                    <button className="course-card-item__details-link" type="button">
                        Подробнее
                    </button>
                </article>

                <button className="course-card-page__select-btn" type="button">
                    Выбрать
                </button>
            </section>

            <Navbar />
        </main>
    );
}
