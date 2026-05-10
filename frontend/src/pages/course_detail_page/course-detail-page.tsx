import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { Navbar } from "../../widgets/navbar/navbar";
import "./course-detail-page.css";

type CourseType = "Авторский" | "Олимпиадный";

const availableCourses = [
    {
        id: 101,
        title: "Название курса",
        teacher: "Преподаватель",
        type: "Олимпиадный" as CourseType,
        desc: "Описание: здесь должно быть очень-очень много текста, связанного с программной математикой курса. Надеюсь, вам стало понятнее, зачем тут так много текста."
    },
    {
        id: 102,
        title: "Название курса",
        teacher: "Преподаватель",
        type: "Авторский" as CourseType,
        desc: "Описание: здесь должно быть очень-очень много текста, связанного с программной математикой курса. Надеюсь, вам стало понятнее, зачем тут так много текста."
    },
    {
        id: 103,
        title: "Название курса",
        teacher: "Преподаватель",
        type: "Олимпиадный" as CourseType,
        desc: "Описание: здесь должно быть очень-очень много текста, связанного с программной математикой курса. Надеюсь, вам стало понятнее, зачем тут так много текста."
    },
];

const lessonSlots = [
    { id: 1, title: "1 урок", time: "10:00 - 11:00" },
    { id: 2, title: "2 урок", time: "11:20 - 12:20" },
    { id: 3, title: "3 урок", time: "12:40 - 13:40" },
];

export function CourseDetailPage() {
    const navigate = useNavigate();
    
    const { slotId } = useSearch({ from: "/course-detail" });
    const currentSlot = lessonSlots.find((slot) => slot.id === slotId) ?? lessonSlots[0];
    
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    const handleSave = () => {
        if (!selectedCourseId) return;

        const course = availableCourses.find(c => c.id === selectedCourseId);
        const currentSelections = JSON.parse(localStorage.getItem("selected_courses") || "{}");
        
        currentSelections[slotId] = course?.title || "Курс";
        localStorage.setItem("selected_courses", JSON.stringify(currentSelections));

        navigate({ to: "/courses" });
    };

    return (
        <main className="course-detail-page">
            <header className="course-detail-header">
                <Link
                    className="course-detail-header__back app-back-button app-back-button--dark"
                    to="/courses"
                    aria-label="Назад"
                >
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1 className="course-detail-header__title">Выбор курсов</h1>
                <div className="course-detail-header__meta">
                    <div className="course-detail-header__date">23 июля - 30 июля</div>
                    <div className="course-detail-header__lesson-time">{currentSlot.title} | {currentSlot.time}</div>
                </div>
            </header>

            <section className="course-detail-list">
                {availableCourses.map((course) => {
                    const isSelected = selectedCourseId === course.id;
                    return (
                        <article 
                            key={course.id} 
                            className={`course-detail-card ${isSelected ? "selected" : ""}`}
                        >
                            <div className="course-detail-card__top">
                                <div className="course-detail-card__title-group">
                                    <h2>{course.title}</h2>
                                    <span className="course-detail-card__teacher">{course.teacher}</span>
                                </div>
                                <span
                                    className={`course-detail-card__badge ${
                                        course.type === "Олимпиадный"
                                            ? "course-detail-card__badge--olympiad"
                                            : "course-detail-card__badge--author"
                                    }`}
                                >
                                    {course.type}
                                </span>
                            </div>

                            <p className="course-detail-card__description">{course.desc}</p>
                            <Link
                                to="/course-card"
                                search={{ slotId, courseId: course.id }}
                                className="course-detail-card__details-link"
                            >
                                Подробнее
                            </Link>
                            
                            <button 
                                className={`course-detail-card__select-btn ${isSelected ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedCourseId((prevId) => (prevId === course.id ? null : course.id));
                                }}
                            >
                                {isSelected ? "Убрать выбор" : "Выбрать курс"}
                            </button>

                            <div className="course-detail-card__thumb" />
                        </article>
                    );
                })}
            </section>

            <footer className="course-detail-footer">
                <button 
                    className={`course-detail-footer__save-btn ${selectedCourseId ? "active" : ""}`}
                    disabled={!selectedCourseId}
                    onClick={handleSave}
                >
                    Сохранить
                </button>
                <p className="course-detail-footer__status">
                    {selectedCourseId ? "Курс выбран" : "Курс не выбран"}
                </p>
            </footer>

            <Navbar />
        </main>
    );
}
