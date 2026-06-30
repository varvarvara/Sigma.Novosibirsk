import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { warmRoute } from "../../../app/route-warmers";
import { AuthApiError } from "../../../entities/auth";
import {
    useEnrollmentSlotOptionsQuery,
    useEnrollmentSlotSelectionQuery,
    useMyEnrollmentsQuery,
} from "../../../entities/student/queries/learning.queries";
import type { SlotOptionsItem } from "../../../entities/student/model/learning.types";
import { CourseCoverThumb } from "../../../shared/ui/course-cover-thumb/course-cover-thumb";
import type { SlotCourseOption } from "../../../entities/student/model/learning.types";
import {
    formatEnrollmentSlotTime,
    normalizeEnrollmentSlotOptions,
    sanitizeDraftSelectionByHour,
} from "../../../features/course-flow/enrollment-slot-times";
import {
    DRAFT_SELECTION_STORAGE_KEY,
    readDraftSelectionByHour,
} from "../../../features/course-flow/resolve-course-flow";
import { pickLessonCoverUrl } from "../../../features/course-selection/lib/pick-lesson-cover-url";
import { hydrateSelectionFromEnrollments } from "../../../features/course-selection/model/selection-draft";
import "../../../styles/field-error.css";
import "./course-selection-page.css";

export default function CourseSelectionContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const gateMessage = (location.state as { gateMessage?: string } | undefined)?.gateMessage ?? "";
    const [selectedByHour, setSelectedByHour] = useState<Record<number, number>>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [submitMessage, setSubmitMessage] = useState("");
    const isDraftHydratedRef = useRef(false);
    const {
        data: slotOptionsRaw,
        isLoading: isSlotOptionsLoading,
        error: slotOptionsError,
    } = useEnrollmentSlotOptionsQuery();
    const {
        data: enrollments,
        isLoading: isEnrollmentsLoading,
        error: enrollmentsError,
    } = useMyEnrollmentsQuery();
    const submitSelectionMutation = useEnrollmentSlotSelectionQuery();

    const slots = useMemo(() => {
        if (!slotOptionsRaw) {
            return [];
        }

        return normalizeEnrollmentSlotOptions(slotOptionsRaw).slots;
    }, [slotOptionsRaw]);

    const isLoading = isSlotOptionsLoading || isEnrollmentsLoading;
    const isSubmitting = submitSelectionMutation.isPending;
    const errorMessageFromQuery =
        slotOptionsError instanceof AuthApiError ? slotOptionsError.message :
        enrollmentsError instanceof AuthApiError ? enrollmentsError.message :
        slotOptionsError || enrollmentsError ? "Не удалось загрузить список курсов." : "";

    const syncDraftFromStorage = useCallback((slotOptions: SlotOptionsItem[], currentEnrollments: NonNullable<typeof enrollments>) => {
        setSelectedByHour(hydrateSelectionFromEnrollments(slotOptions, currentEnrollments));
        isDraftHydratedRef.current = true;
    }, []);

    useEffect(() => {
        if (!slots.length || !enrollments) {
            return;
        }

        syncDraftFromStorage(slots, enrollments);
    }, [enrollments, slots, syncDraftFromStorage]);

    useEffect(() => {
        if (location.pathname !== "/courses" || slots.length === 0) {
            return;
        }

        const fromDraft = readDraftSelectionByHour(slots);
        if (Object.keys(fromDraft).length === 0) {
            return;
        }

        setSelectedByHour((prev) => ({ ...prev, ...fromDraft }));
    }, [location.pathname, slots]);

    useEffect(() => {
        if (!isDraftHydratedRef.current) {
            return;
        }

        localStorage.setItem(
            DRAFT_SELECTION_STORAGE_KEY,
            JSON.stringify(sanitizeDraftSelectionByHour(selectedByHour)),
        );
    }, [selectedByHour]);

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

    const allSlotsSelected = lessons.length > 0 && lessons.every((lesson) => Boolean(selectedByHour[lesson.slotHour]));

    const handleSubmitSelection = async () => {
        if (isSubmitting || lessons.length === 0) {
            return;
        }

        const selections = lessons
            .map((lesson) => ({
                slot_hour: lesson.slotHour,
                course_id: selectedByHour[lesson.slotHour],
            }))
            .filter((item) => Boolean(item.course_id)) as { slot_hour: number; course_id: number }[];

        if (selections.length !== lessons.length) {
            setErrorMessage("Выберите курс в каждом слоте перед сохранением.");
            return;
        }

        setErrorMessage("");
        setSubmitMessage("");

        try {
            const response = await submitSelectionMutation.mutateAsync(selections);
            setSubmitMessage(response.message);
            localStorage.removeItem(DRAFT_SELECTION_STORAGE_KEY);
            navigate({ to: "/soon-update" });
        } catch (error) {
            if (error instanceof AuthApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Не удалось сохранить выбор курсов.");
            }
        }
    };

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
                {isLoading ? <p className="lesson-status">Загрузка курсов...</p> : null}
                {!isLoading && gateMessage ? <p className="lesson-status">{gateMessage}</p> : null}
                {!isLoading && errorMessageFromQuery ? <p className="field-error">{errorMessageFromQuery}</p> : null}
                {!isLoading && !errorMessageFromQuery && errorMessage ? <p className="field-error">{errorMessage}</p> : null}
                {!isLoading && !errorMessageFromQuery && !errorMessage && lessons.length === 0 ? (
                    <p className="lesson-status">Слоты пока не опубликованы.</p>
                ) : null}

                {lessons.map((lesson) => {
                    const selectedCourseId = selectedByHour[lesson.slotHour];
                    const selectedCourse = lesson.courses.find((course) => course.course_id === selectedCourseId);
                    const slot = slots.find((item) => item.slot_hour === lesson.slotHour);
                    const coverImageUrl = pickLessonCoverUrl(
                        slot ?? { slot_hour: lesson.slotHour, courses: lesson.courses },
                        selectedCourse,
                    );
                    const chosenName = selectedCourse?.title ?? null;
                    const isSelected = Boolean(chosenName);

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
                                        className={`select-btn${isSelected ? " select-btn--selected" : ""}`}
                                        onPointerEnter={() => warmRoute("/course-detail")}
                                        onFocus={() => warmRoute("/course-detail")}
                                    >
                                        {isSelected ? "Изменить выбор" : "Выбрать курс"}
                                    </Link>
                                </div>
                                <CourseCoverThumb src={coverImageUrl} />
                            </div>
                        </article>
                    );
                })}
            </section>

            <footer className="page-footer">
                <button
                    className={`register-btn${allSlotsSelected ? " register-btn--ready" : ""}`}
                    onClick={handleSubmitSelection}
                    disabled={isSubmitting || lessons.length === 0 || !allSlotsSelected}
                    onPointerEnter={() => warmRoute("/soon-update")}
                    onFocus={() => warmRoute("/soon-update")}
                >
                    {isSubmitting ? "Сохраняем..." : "Зарегистрироваться"}
                </button>
                <p className="footer-text">
                    {submitMessage || (allSlotsSelected ? "Можно зарегистрировать выбор" : "Выберите курс в каждом слоте")}
                </p>
            </footer>

        </main>
    );
}
