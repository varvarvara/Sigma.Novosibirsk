import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { Button } from "../../components/base/buttons/button";
import { Navbar } from "../../widgets/navbar/navbar";
import "./filter-page.css";

const courses = [
    "Название курса",
    "Название курса",
    "Название курса",
    "Название курса",
];

const periods = ["01.08.2026", "02.08.2026", "03.08.2026", "04.08.2026", "05.08.2026", "06.08.2026", "07.08.2026"];

export function FilterPage() {
    const navigate = useNavigate();
    const [selectedCourseIndexes, setSelectedCourseIndexes] = useState<Set<number>>(new Set());
    const [selectedPeriodIndexes, setSelectedPeriodIndexes] = useState<Set<number>>(new Set());

    const toggleCourse = (index: number) => {
        setSelectedCourseIndexes((previous) => {
            const next = new Set(previous);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const togglePeriod = (index: number) => {
        setSelectedPeriodIndexes((previous) => {
            const next = new Set(previous);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    return (
        <main className="filter-page">
            <header className="filter-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/curricular" aria-label="Назад">
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1>Фильтр</h1>
            </header>

            <section className="filter-section filter-course-section">
                <h2>Предмет</h2>

                <div className="course-list" aria-label="Преподаватель Имяы">
                    {courses.map((course, index) => (
                        <button
                            className={`filter-row${selectedCourseIndexes.has(index) ? " filter-row-selected" : ""}`}
                            type="button"
                            key={`${course}-${index}`}
                            onClick={() => toggleCourse(index)}
                            aria-pressed={selectedCourseIndexes.has(index)}
                        >
                            <span>{course}</span>
                            <span>Преподаватель Имя</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="filter-section filter-period-section">
                <h2>Дата</h2>

                <div className="period-list" aria-label="Период">
                    {periods.map((period, index) => (
                        <button
                            className={`period-chip${selectedPeriodIndexes.has(index) ? " period-chip-selected" : ""}`}
                            type="button"
                            key={period}
                            onClick={() => togglePeriod(index)}
                            aria-pressed={selectedPeriodIndexes.has(index)}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </section>

            <div className="filter-save-panel">
                <Button color="primary" size="md" className="filter-save-button" onClick={() => navigate({ to: "/curricular", hash: "charges" })}>
                    Сохранить
                </Button>
            </div>

            <Navbar />
        </main>
    );
}
