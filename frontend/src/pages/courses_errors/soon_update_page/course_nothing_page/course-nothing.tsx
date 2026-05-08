import { Navbar } from "../../../../widgets/navbar/navbar";
import "./course-nothing.css";

export function CourseNothingPage() {
    return (
        <main className="course-nothing-page">
            <section className="course-nothing-content">
                <h1>В этом разделе ничего нет</h1>
                <h2>Попробуйте позже</h2>
            </section>

            <Navbar />
        </main>
    );
}
