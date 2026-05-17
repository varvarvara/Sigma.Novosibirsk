import { Link, useNavigate } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Button } from "../../../components/base/buttons/button";
import "./feedback.css";

const ratingOptions = [
    { icon: "/Worst Style.svg", label: "Ужасно" },
    { icon: "/It's Just Fine Style.svg", label: "Так себе" },
    { icon: "/Neutral.svg", label: "Ок" },
    { icon: "/Good Style.svg", label: "Неплохо" },
    { icon: "/Love it Style.svg", label: "Сигма" },
];

export function FeedbackPage() {
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const activeRatingIndex = Math.round(rating);
    const ratingProgress = `${(rating / (ratingOptions.length - 1)) * 100}%`;

    return (
        <main className="feedback-page">
            <header className="feedback-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/soon-update" aria-label="Назад">
                    <svg className="app-back-button__icon feedback-back-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="12" fill="#3A3651" fillOpacity="0.5" />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.1599 7.48755C14.4981 7.85179 14.477 8.42125 14.1128 8.75947L10.623 12L14.1128 15.2404C14.477 15.5787 14.4981 16.1481 14.1599 16.5124C13.8217 16.8766 13.2522 16.8977 12.888 16.5595L8.68798 12.6595C8.50459 12.4892 8.40039 12.2502 8.40039 12C8.40039 11.7497 8.50459 11.5107 8.68798 11.3404L12.888 7.44044C13.2522 7.10222 13.8217 7.12331 14.1599 7.48755Z"
                            fill="white"
                        />
                    </svg>
                </Link>
                <div className="feedback-header-title">
                    <h1>Мои курсы</h1>
                    <span>Фидбэк</span>
                </div>
            </header>

            <section className="feedback-course-card" aria-label="Курс">
                <div>
                    <h2>Название курса</h2>
                    <p> ФИО Преподавателя</p>
                </div>
            </section>

            <section className="feedback-form" aria-label="Форма фидбека">
                <div className="feedback-rating-icons" aria-hidden="true">
                    {ratingOptions.map((option, index) => (
                        <div className="feedback-rating-item" key={option.label}>
                            <img
                                className={`feedback-rating-icon${activeRatingIndex === index ? " feedback-rating-icon-active" : ""}`}
                                src={option.icon}
                                alt=""
                            />
                            <span className={`feedback-rating-label${activeRatingIndex === index ? " feedback-rating-label-active" : ""}`}>
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="feedback-range-wrap" style={{ "--feedback-progress": ratingProgress } as CSSProperties}>
                    <div className="feedback-range-track" />
                    <input
                        className="feedback-range"
                        type="range"
                        min="0"
                        max={ratingOptions.length - 1}
                        step="0.01"
                        value={rating}
                        aria-label="Оценка курса"
                        onChange={(event) => setRating(Number(event.target.value))}
                    />
                </div>

                <textarea
                    className="feedback-comment"
                    value={comment}
                    placeholder="Ваш комментарий"
                    aria-label="Ваш комментарий"
                    onChange={(event) => setComment(event.target.value)}
                />
            </section>

            <div className="feedback-save-panel">
                <Button color="primary" size="md" className="feedback-save-button" onClick={() => navigate({ to: "/soon-update" })}>
                    Отправить
                </Button>
            </div>

        </main>
    );
}
