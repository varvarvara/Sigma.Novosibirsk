import { useNavigate } from "@tanstack/react-router";
import { Button } from "../../../shared/ui/button/button";
import "./course-choice.css";

export function CourseChoicePage() {
    const navigate = useNavigate();

    return (
        <main className="course-choice-page">
            <section className="course-choice-content">
                <h1 className="course-choice-title-button">Курсы не выбраны</h1>
                <Button
                    color="primary"
                    size="md"
                    className="course-choice-button"
                    onClick={() => navigate({ to: "/courses" })}
                >
                    Выбрать
                </Button>
            </section>

        </main>
    );
}
