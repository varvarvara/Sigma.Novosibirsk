import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { AuthApiError } from "../../../entities/auth";
import { useMyAttendanceFilterOptionsQuery } from "../../../entities/student/queries/learning.queries";
import { Button } from "../../../shared/ui/buttons/button";
import {
    formatFilterDateLabel,
    readCurricularChargesFilter,
    writeCurricularChargesFilter,
} from "../../../features/curricular-filter/model/curricular-charges-filter";
import "./filter-page.css";

export function FilterPage() {
    const navigate = useNavigate();
    const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
    const { data: options, isLoading, error } = useMyAttendanceFilterOptionsQuery();
    const hasSelectedFilters = selectedCourseIds.size > 0 || selectedDates.size > 0;
    const courses = options?.courses ?? [];
    const dates = options?.dates ?? [];
    const errorMessage =
        error instanceof AuthApiError
            ? error.message
            : error
                ? "Не удалось загрузить фильтр."
                : "";

    useEffect(() => {
        if (!options) {
            return;
        }

        if (options.courses.length === 0) {
            navigate({ to: "/curricular", replace: true });
            return;
        }

        const saved = readCurricularChargesFilter();
        const allCourseIds = options.courses.map((course) => course.course_id);
        const allDates = options.dates;

        setSelectedCourseIds(
            new Set(
                saved?.courseIds.length
                    ? saved.courseIds.filter((id) => allCourseIds.includes(id))
                    : [],
            ),
        );
        setSelectedDates(
            new Set(
                saved?.dates.length
                    ? saved.dates.filter((date) => allDates.includes(date))
                    : [],
            ),
        );
    }, [navigate, options]);

    const toggleCourse = (courseId: number) => {
        setSelectedCourseIds((previous) => {
            const next = new Set(previous);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const toggleDate = (isoDate: string) => {
        setSelectedDates((previous) => {
            const next = new Set(previous);
            if (next.has(isoDate)) {
                next.delete(isoDate);
            } else {
                next.add(isoDate);
            }
            return next;
        });
    };

    const handleSave = () => {
        writeCurricularChargesFilter({
            courseIds: Array.from(selectedCourseIds),
            dates: Array.from(selectedDates),
        });
        navigate({ to: "/curricular", hash: "charges" });
    };

    return (
        <main className="filter-page">
            <header className="filter-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/curricular" aria-label="Назад">
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1>Фильтр</h1>
            </header>

            {isLoading ? <p className="filter-status">Загрузка фильтра...</p> : null}
            {!isLoading && errorMessage ? <p className="filter-status">{errorMessage}</p> : null}

            {!isLoading && !errorMessage ? (
                <>
                    <section className="filter-section filter-course-section">
                        <h2>Предмет</h2>

                        <div className="course-list" aria-label="Курсы студента">
                            {courses.map((course) => (
                                <button
                                    className={`filter-row${selectedCourseIds.has(course.course_id) ? " filter-row-selected" : ""}`}
                                    type="button"
                                    key={course.course_id}
                                    onClick={() => toggleCourse(course.course_id)}
                                    aria-pressed={selectedCourseIds.has(course.course_id)}
                                >
                                    <span className="filter-row__title">{course.course_title}</span>
                                    <span className="filter-row__teacher">{course.teacher_name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="filter-section filter-period-section">
                        <h2>Дата</h2>

                        {dates.length === 0 ? (
                            <p className="filter-status">Даты занятий появятся после публикации расписания.</p>
                        ) : (
                            <div className="period-list" aria-label="Даты занятий">
                                {dates.map((isoDate) => (
                                    <button
                                        className={`period-chip${selectedDates.has(isoDate) ? " period-chip-selected" : ""}`}
                                        type="button"
                                        key={isoDate}
                                        onClick={() => toggleDate(isoDate)}
                                        aria-pressed={selectedDates.has(isoDate)}
                                    >
                                        {formatFilterDateLabel(isoDate)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="filter-save-panel">
                        <Button
                            color="primary"
                            size="md"
                            className="filter-save-button"
                            onClick={handleSave}
                            isDisabled={!hasSelectedFilters}
                        >
                            Сохранить
                        </Button>
                    </div>
                </>
            ) : null}
        </main>
    );
}
