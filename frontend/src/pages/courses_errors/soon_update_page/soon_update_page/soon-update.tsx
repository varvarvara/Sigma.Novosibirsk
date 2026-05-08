import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "../../../../widgets/navbar/navbar";
import "./soon-update.css";

export function SoonUpdatePage() {
    const navigate = useNavigate();

    return (
        <main className="soon-update-page">
            <section className="soon-update-content">
                <button
                    type="button"
                    className="soon-update-title-button"
                    onClick={() => navigate({ to: "/course-choice" })}
                >
                    Скоро тут появится нужная информация
                </button>
            </section>

            <Navbar />
        </main>
    );
}
