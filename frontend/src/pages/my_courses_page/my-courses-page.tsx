import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../../components/base/buttons/button";
import { Navbar } from "../../widgets/navbar/navbar";
import "./my-courses-page.css";

type Course = {
    id: number;
    title: string;
    teacher: string;
    status: "active" | "soon" | "finished";
    statusLabel: string;
    details: string;
};

const courses: Course[] = [
    {
        id: 1,
        title: "Название курса",
        teacher: "Преподаватель",
        status: "soon",
        statusLabel: "Скоро",
        details:
            "Описание: здесь должно быть очень-очень много текста, связанного с программой и материалами курса. Надеюсь, вам стало понятнее, зачем тут так много текста.",
    },
    {
        id: 2,
        title: "Название курса",
        teacher: "Преподаватель",
        status: "active",
        statusLabel: "Проходит",
        details:
            "Описание: здесь должно быть очень-очень много текста, связанного с программой и материалами курса. Надеюсь, вам стало понятнее, зачем тут так много текста.",
    },
    {
        id: 3,
        title: "Название курса",
        teacher: "Преподаватель",
        status: "finished",
        statusLabel: "Завершился",
        details:
            "Описание: здесь должно быть очень-очень много текста, связанного с программой и материалами курса. Надеюсь, вам стало понятнее, зачем тут так много текста.",
    },
];

export function MyCoursesPage() {
    const navigate = useNavigate();
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggleCourse = (id: number) => {
        setExpandedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
    };

    return (
        <main className="my-courses-page">
            <header className="my-courses-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/soon-update" aria-label="Назад">
                    <svg className="app-back-button__icon my-courses-back-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="12" fill="#3A3651" fillOpacity="0.5" />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.1599 7.48755C14.4981 7.85179 14.477 8.42125 14.1128 8.75947L10.623 12L14.1128 15.2404C14.477 15.5787 14.4981 16.1481 14.1599 16.5124C13.8217 16.8766 13.2522 16.8977 12.888 16.5595L8.68798 12.6595C8.50459 12.4892 8.40039 12.2502 8.40039 12C8.40039 11.7497 8.50459 11.5107 8.68798 11.3404L12.888 7.44044C13.2522 7.10222 13.8217 7.12331 14.1599 7.48755Z"
                            fill="white"
                        />
                    </svg>
                </Link>
                <div className="my-courses-header-title">
                    <h1>Мои курсы</h1>
                    <span>Сезон 2026</span>
                </div>
            </header>

            <section className="my-courses-list" aria-label="Мои курсы">
                {courses.map((course) => {
                    const expanded = expandedIds.includes(course.id);

                    return (
                        <article className={`my-course-card${expanded ? " my-course-card--expanded" : ""}`} key={course.id}>
                            <div className="my-course-card__top">
                                <div className="my-course-card__title-group">
                                    <h2>{course.title}</h2>
                                    <p>{course.teacher}</p>
                                </div>
                                <span className={`my-course-status my-course-status--${course.status}`}>{course.statusLabel}</span>
                            </div>

                            <p className="my-course-card__text">
                                {course.details}
                            </p>

                            <button className={`my-course-details${expanded ? " my-course-details--active" : ""}`} type="button" onClick={() => toggleCourse(course.id)}>
                                {expanded ? "Скрыть" : "Подробнее"}
                            </button>

                            {course.status === "finished" && (
                                <div className="my-course-actions">
                                    <Button color="primary" size="md" className="my-course-feedback" onClick={() => navigate({ to: "/feedback" })}>
                                        Оставить фидбэк
                                    </Button>
                                    <Button color="secondary" size="md" className="my-course-certificate">
                                        Скачать сертификат
                                    </Button>
                                </div>
                            )}
                        </article>
                    );
                })}
            </section>

            <Navbar />
        </main>
    );
}
