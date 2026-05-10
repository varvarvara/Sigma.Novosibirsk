import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { Navbar } from "../../widgets/navbar/navbar";
import "./course-selection-page.css";

const lessons = [
    { id: 1, title: "1 урок", time: "10:00 - 11:00" },
    { id: 2, title: "2 урок", time: "11:20 - 12:20" },
    { id: 3, title: "3 урок", time: "12:40 - 13:40" },
];

export function CourseSelectionPage() {
    const [selectedCourses, setSelectedCourses] = useState<Record<number, string>>({});

    useEffect(() => {
        const stored = localStorage.getItem("selected_courses");
        if (stored) setSelectedCourses(JSON.parse(stored));
    }, []);

    return (
        <main className="course-selection-page">
            <header className="course-header">
                <Link
                    className="course-header__back app-back-button app-back-button--dark"
                    to="/profile"
                    aria-label="Назад в профиль"
                >
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1 className="header-title">Выбор курсов</h1>
                <span className="header-date">23 июля - 30 июля</span>
            </header>

            <section className="lessons-list" aria-label="Выбор курсов по слотам">
                {lessons.map((lesson) => {
                    const chosenName = selectedCourses[lesson.id];
                    const isSelected = !!chosenName;

                    return (
                        <article className="lesson-card" key={lesson.id}>
                            <div className="card-header">
                                <h2 className="lesson-title">{lesson.title}</h2>
                                <span className="lesson-time">{lesson.time}</span>
                            </div>

                            <div className="card-body">
                                <div className="card-info">
                                    <span className="lesson-status">
                                        {isSelected ? `Выбрано: ${chosenName}` : "Вы не выбрали курс"}
                                    </span>
                                    <Link
                                        to="/course-detail"
                                        search={{ slotId: lesson.id }}
                                        className="select-btn"
                                    >
                                        {isSelected ? "Изменить выбор" : "Выбрать курс"}
                                    </Link>
                                </div>
                                <div className="card-placeholder"></div>
                            </div>
                        </article>
                    );
                })}
            </section>

            <footer className="page-footer">
                <button className="register-btn">Зарегистрироваться</button>
                <p className="footer-text">Выберите курс в каждом слоте</p>
            </footer>

            <Navbar />
        </main>
    );
}
