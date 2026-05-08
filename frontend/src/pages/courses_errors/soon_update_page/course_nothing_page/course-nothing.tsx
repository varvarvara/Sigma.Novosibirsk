import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "../../../../widgets/navbar/navbar";
import "./course-nothing.css";

export function CourseNothingPage() {
    const navigate = useNavigate();

    return (
        <main className="course-nothing-page">
            <section className="course-nothing-content">
                <button
                    type="button"
                    className="course-nothing-title-button"
                    onClick={() => navigate({ to: "/soon-update" })}
                >
                    <span className="course-nothing-title-main">В этом разделе ничего нет</span>
                    <span className="course-nothing-title-sub">Попробуйте позже</span>
                </button>
            </section>

            <Navbar />
        </main>
    );
}
