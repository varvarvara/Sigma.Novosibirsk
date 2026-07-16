import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { AuthApiError } from "../../../entities/auth";
import { CourseCoverThumb } from "../../../components/course-cover-thumb/course-cover-thumb";
import {
    formatEnrollmentSlotTime,
    normalizeEnrollmentSlotOptions,
} from "../../../features/course-flow/enrollment-slot-times";
import { DRAFT_SELECTION_STORAGE_KEY } from "../../../features/course-flow/resolve-course-flow";
import { getEnrollmentSlotOptions } from "../../../entities/students/api/learning.api";
import type { SlotCourseOption, SlotOptionsItem } from "../../../entities/students/model/learning.types";
import "./course-detail-page.css";

type CourseType = "Авторский" | "Олимпиадный";

function mapCourseType(value: string | null | undefined): CourseType {
    return value === "Olympiad" ? "Олимпиадный" : "Авторский";
}

type DetailCourse = {
    id: number;
    title: string;
    teacher: string;
    type: CourseType;
    desc: string;
    coverImageUrl: string | null;
};

export function CourseDetailPage() {
    const navigate = useNavigate();
    const { slotId } = useSearch({ from: "/course-detail" });

    const [slots, setSlots] = useState<SlotOptionsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const slotOptions = normalizeEnrollmentSlotOptions(await getEnrollmentSlotOptions());
                setSlots(slotOptions.slots);
            } catch (error) {
                if (error instanceof AuthApiError) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("Не удалось загрузить список курсов.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, []);

    const lessons = useMemo(
        () =>
            slots.map((slot, index) => ({
                id: index + 1,
                slotHour: slot.slot_hour,
                title: `${index + 1} урок`,
                time: formatEnrollmentSlotTime(slot.slot_hour),
                courses: slot.courses,
            })),
        [slots],
    );

    const currentSlot = lessons.find((slot) => slot.id === slotId) ?? lessons[0];

    useEffect(() => {
        if (!currentSlot) {
            return;
        }

        const draftRaw = localStorage.getItem(DRAFT_SELECTION_STORAGE_KEY);
        const draft = draftRaw ? (JSON.parse(draftRaw) as Record<string, number>) : {};
        const selectedId = draft[String(currentSlot.slotHour)];
        setSelectedCourseId(selectedId ?? null);
    }, [currentSlot]);

    const availableCourses: DetailCourse[] = useMemo(() => {
        if (!currentSlot) {
            return [];
        }
        return currentSlot.courses.map((course: SlotCourseOption) => ({
            id: course.course_id,
            title: course.title,
            teacher: course.teacher_name ?? "Преподаватель не указан",
            type: mapCourseType(course.course_type),
            desc: course.description ?? "Описание курса пока не добавлено.",
            coverImageUrl: course.cover_image_url,
        }));
    }, [currentSlot]);

    const saveCourse = (courseId: number | null) => {
        if (!currentSlot) {
            return;
        }

        const draftRaw = localStorage.getItem(DRAFT_SELECTION_STORAGE_KEY);
        const draft = draftRaw ? (JSON.parse(draftRaw) as Record<string, number>) : {};
        if (courseId === null) {
            delete draft[String(currentSlot.slotHour)];
        } else {
            draft[String(currentSlot.slotHour)] = courseId;
        }
        localStorage.setItem(DRAFT_SELECTION_STORAGE_KEY, JSON.stringify(draft));
    };

    const handleSave = () => {
        saveCourse(selectedCourseId);
        navigate({ to: "/courses" });
    };

    const toggleCourseSelection = (courseId: number) => {
        const nextSelectedId = selectedCourseId === courseId ? null : courseId;
        setSelectedCourseId(nextSelectedId);
        saveCourse(nextSelectedId);
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
                    <div className="course-detail-header__lesson-time">
                        {currentSlot ? `${currentSlot.title} | ${currentSlot.time}` : ""}
                    </div>
                </div>
            </header>

            <section className="course-detail-list">
                {isLoading ? <p className="course-detail-footer__status">Загрузка курсов...</p> : null}
                {!isLoading && errorMessage ? <p className="course-detail-footer__status">{errorMessage}</p> : null}
                {!isLoading && !errorMessage && availableCourses.length === 0 ? (
                    <p className="course-detail-footer__status">На этот слот пока нет доступных курсов.</p>
                ) : null}

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
                                onClick={() => toggleCourseSelection(course.id)}
                            >
                                {isSelected ? "Убрать выбор" : "Выбрать курс"}
                            </button>

                            <CourseCoverThumb
                                src={course.coverImageUrl}
                                className="course-detail-card__thumb"
                            />
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

        </main>
    );
}
