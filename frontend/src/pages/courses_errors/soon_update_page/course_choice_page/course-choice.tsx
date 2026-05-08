import { useNavigate } from "@tanstack/react-router";
import { Button } from "../../../../components/base/buttons/button";
import { Navbar } from "../../../../widgets/navbar/navbar";
import "./course-choice.css";
//исправить навигацию кнопки  после того, как добавится выбор курсов 

export function CourseChoicePage() {
    const navigate = useNavigate();

    return (
        <main className="course-choice-page">
            <section className="course-choice-content">
                <button
                    type="button"
                    className="course-choice-title-button"
                    onClick={() => navigate({ to: "/course-nothing" })}
                >
                    Курсы не выбраны
                </button>
                <Button color="primary" size="md" className="course-choice-button" onClick={() => navigate({ to: "/course-nothing" })}>
                    Выбрать
                </Button>
            </section>

            <Navbar />
        </main>
    );
}
