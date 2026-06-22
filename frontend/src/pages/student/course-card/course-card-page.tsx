import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { AuthApiError } from "../../../entities/auth";
import { useEnrollmentSlotOptionsQuery } from "../../../entities/student/queries/learning.queries";
import {
    formatEnrollmentSlotTime,
    normalizeEnrollmentSlotOptions,
} from "../../../features/course-flow/enrollment-slot-times";
import { DRAFT_SELECTION_STORAGE_KEY } from "../../../features/course-flow/resolve-course-flow";
import "./course-card-page.css";

type CourseType = "Авторский" | "Олимпиадный";

function mapCourseType(value: string | null | undefined): CourseType {
    return value === "Olympiad" ? "Олимпиадный" : "Авторский";
}

export function CourseCardPage() {
    const navigate = useNavigate();
    const { slotId, courseId } = useSearch({ from: "/course-card" });
    const { data: slotOptionsRaw, error } = useEnrollmentSlotOptionsQuery();
    const slots = useMemo(() => {
        if (!slotOptionsRaw) {
            return [];
        }

        const slotOptions = normalizeEnrollmentSlotOptions(slotOptionsRaw);
        return slotOptions.slots.map((slot, index) => ({
            id: index + 1,
            slotHour: slot.slot_hour,
            title: `${index + 1} урок`,
            time: formatEnrollmentSlotTime(slot.slot_hour),
            courses: slot.courses,
        }));
    }, [slotOptionsRaw]);
    const errorMessage =
        error instanceof AuthApiError
            ? error.message
            : error
                ? "Не удалось загрузить данные курса."
                : "";

    const currentSlot = slots.find((slot) => slot.id === slotId) ?? slots[0];
    const currentCourse = useMemo(() => {
        const course = currentSlot?.courses.find((item) => item.course_id === courseId);
        if (!course) {
            return null;
        }
        return {
            id: course.course_id,
            title: course.title,
            teacher: course.teacher_name ?? "Преподаватель не указан",
            type: mapCourseType(course.course_type),
            desc: course.description ?? "Описание курса пока не добавлено.",
            syllabusUrl: course.syllabus_url,
            extraLines: [] as string[],
        };
    }, [currentSlot, courseId]);

    const handleSelect = () => {
        if (!currentCourse || !currentSlot) {
            return;
        }

        const draftRaw = localStorage.getItem(DRAFT_SELECTION_STORAGE_KEY);
        const draft = draftRaw ? (JSON.parse(draftRaw) as Record<string, number>) : {};

        draft[String(currentSlot.slotHour)] = currentCourse.id;
        localStorage.setItem(DRAFT_SELECTION_STORAGE_KEY, JSON.stringify(draft));

        navigate({ to: "/courses" });
    };

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
                        {currentSlot ? `${currentSlot.title} | ${currentSlot.time}` : ""}
                    </div>
                </div>
            </header>

            <section className="course-card-content">
                {errorMessage ? <p className="course-card-item__description">{errorMessage}</p> : null}
                {!currentCourse && !errorMessage ? (
                    <p className="course-card-item__description">Курс не найден для выбранного слота.</p>
                ) : null}

                {currentCourse ? (
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

                    <div className="course-card-item__text-block">
                        <p className="course-card-item__description">{currentCourse.desc}</p>

                        <a
                            className={`course-card-item__syllabus-link${
                                currentCourse.syllabusUrl ? "" : " course-card-item__syllabus-link--inactive"
                            }`}
                            href={currentCourse.syllabusUrl ?? undefined}
                            target={currentCourse.syllabusUrl ? "_blank" : undefined}
                            rel={currentCourse.syllabusUrl ? "noopener noreferrer" : undefined}
                            aria-disabled={currentCourse.syllabusUrl ? undefined : true}
                            onClick={(event) => {
                                if (!currentCourse.syllabusUrl) {
                                    event.preventDefault();
                                }
                            }}
                        >
                            Посмотреть Силлабус
                        </a>
                    </div>

                    {currentCourse.extraLines.map((line) => (
                        <p key={line} className="course-card-item__extra-line">
                            {line}
                        </p>
                    ))}
                </article>
                ) : null}

                <button className="course-card-page__select-btn" type="button" onClick={handleSelect} disabled={!currentCourse}>
                    Выбрать
                </button>
            </section>

        </main>
    );
}
