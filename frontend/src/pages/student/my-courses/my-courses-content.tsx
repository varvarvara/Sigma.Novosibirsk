import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { warmRoute } from "../../../app/route-warmers";
import { AuthApiError } from "../../../entities/auth";
import type { EnrollmentOutput } from "../../../entities/student/model/learning.types";
import { Button } from "../../../shared/ui/buttons/button";
import "./my-courses-page.css";
import { useMyEnrollmentsQuery } from "../../../entities/student/queries/learning.queries";

type Course = {
    id: number;
    title: string;
    teacher: string;
    status: "active" | "soon" | "finished";
    statusLabel: string;
    details: string;
};

function mapCourseStatus(status: EnrollmentOutput["enrollment_status"]): Course["status"] {
    if (status === "Completed") {
        return "finished";
    }
    if (status === "Dropped") {
        return "soon";
    }
    return "active";
}

function mapCourseStatusLabel(status: EnrollmentOutput["enrollment_status"]) {
    if (status === "Completed") {
        return "Завершился";
    }
    if (status === "Dropped") {
        return "Отменён";
    }
    return "Проходит";
}

export default function MyCoursesContent() {
    const navigate = useNavigate();
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const {
        data: enrollments = [],
        isLoading,
        error
    } = useMyEnrollmentsQuery();


    const errorMessage =
        error instanceof AuthApiError
            ? error.message
            : error
                ? "Не удалось загрузить список выбранных курсов."
                : "";

    const courses = useMemo(
        () =>
            enrollments
                .filter((enrollment) => enrollment.enrollment_status === "Active")
                .map((enrollment) => ({
                    id: enrollment.id,
                    title: enrollment.course_title,
                    teacher: enrollment.teacher_name ?? "Преподаватель не указан",
                    status: mapCourseStatus(enrollment.enrollment_status),
                    statusLabel: mapCourseStatusLabel(enrollment.enrollment_status),
                    details: enrollment.course_description ?? "Описание курса пока не добавлено"
                })),
        [enrollments],
    )

    const toggleCourse = (id: number) => {
        setExpandedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
    };

    return (
        <main className="my-courses-page">
            <header className="my-courses-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/profile" aria-label="Назад">
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <div className="my-courses-header-title">
                    <h1>Мои курсы</h1>
                    <span>Сезон 2026</span>
                </div>
            </header>

            <section className="my-courses-list" aria-label="Мои курсы">
                {isLoading ? <p className="my-course-card__text">Загрузка...</p> : null}
                {!isLoading && errorMessage ? <p className="my-course-card__text">{errorMessage}</p> : null}
                {!isLoading && !errorMessage && courses.length === 0 ? (
                    <article className="my-course-card">
                        <p className="my-course-card__text">У вас пока нет выбранных курсов.</p>
                        <Button
                            color="primary"
                            size="md"
                            className="my-course-feedback"
                            onClick={() => navigate({ to: "/courses-entry" })}
                            onPointerEnter={() => warmRoute("/courses-entry")}
                            onFocus={() => warmRoute("/courses-entry")}
                        >
                            Выбрать курсы
                        </Button>
                    </article>
                ) : null}

                {courses.map((course) => {
                    const expanded = expandedIds.includes(course.id);

                    return (
                        <article
                            className={`my-course-card${expanded ? " my-course-card--expanded" : ""}`}
                            key={course.id}
                            onClick={() => toggleCourse(course.id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    toggleCourse(course.id);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-expanded={expanded}
                        >
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

                            <button
                                className={`my-course-details${expanded ? " my-course-details--active" : ""}`}
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    toggleCourse(course.id);
                                }}
                            >
                                {expanded ? "Скрыть" : "Подробнее"}
                            </button>

                            {course.status === "finished" && (
                                <div className="my-course-actions">
                                    <Button
                                        color="primary"
                                        size="md"
                                        className="my-course-feedback"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            navigate({ to: "/feedback" });
                                        }}
                                        onPointerEnter={() => warmRoute("/feedback")}
                                        onFocus={() => warmRoute("/feedback")}
                                    >
                                        Оставить фидбэк
                                    </Button>
                                    <Button
                                        color="secondary"
                                        size="md"
                                        className="my-course-certificate"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        Скачать сертификат
                                    </Button>
                                </div>
                            )}
                        </article>
                    );
                })}
            </section>

        </main>
    );
}
