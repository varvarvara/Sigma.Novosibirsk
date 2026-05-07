import { Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "../../widgets/navbar/navbar";
import "./curricular.css";

const charges = [
    {
        date: "28.07",
        bonus: "+4",
        items: [
            {
                title: "Название начисления",
                value: "Курс, за который начисляется балл баллов",
                icon: "/magic.svg",
                large: false,
            },
            {
                title: "Название начисления",
                value: "Курс, за который начисляется балл",
                icon: "/star.svg",
                large: true,
            },
        ],
    },
    {
        date: "29.07",
        bonus: "+4",
        items: [
            {
                title: "Название начисления",
                value: "Курс, за который начисляется балл баллов",
                icon: "/magic.svg",
                large: false,
            },
            {
                title: "Название начисления",
                value: "Курс, за который начисляется балл баллов",
                icon: "/magic.svg",
                large: false,
            },
        ],
    },
];

export function CurricularPage() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash === "charges") {
            document.getElementById("curricular-charges")?.scrollIntoView({ block: "start" });
        }
    }, [hash]);

    return (
        <main className="curricular-page">
            <header className="curricular-header">
                <Link className="back-button" to="/profile" aria-label="Назад в профиль">
                    <span />
                </Link>
                <h1>Учебная активность</h1>
            </header>

            <section className="curricular-summary">
                <div className="summary-main">
                    <img src="/flash.svg" alt="" />
                    <p>732</p>
                </div>

                <div className="summary-details">
                    <div>
                        <h2>посещаемость</h2>
                        <p>
                            <img src="/magic.svg" alt="" />
                            <span>700</span>
                        </p>
                    </div>
                    <div>
                        <h2>ачивки</h2>
                        <p>
                            <img src="/star.svg" alt="" />
                            <span>32</span>
                        </p>
                    </div>
                </div>
            </section>

            <section className="curricular-charges" id="curricular-charges">
                <div className="curricular-charges-header">
                    <h2>Начисления</h2>
                    <Link className="curricular-filter-button" to="/curricular-filter" aria-label="Фильтр начислений">
                        <img src="/filter.svg" alt="" />
                    </Link>
                </div>

                <div className="curricular-charges-list">
                    {charges.map((group) => (
                        <div className="curricular-charge-group" key={group.date}>
                            <div className="curricular-date-row">
                                <p>{group.date}</p>
                                <div className="curricular-date-bonus">
                                    <span>{group.bonus}</span>
                                    <img src="/star.svg" alt="" />
                                </div>
                            </div>

                            {group.items.map((item, index) => (
                                <article
                                    className={`curricular-charge-row${item.large ? " curricular-charge-row-large" : ""}`}
                                    key={`${group.date}-${index}`}
                                >
                                    <div className="curricular-charge-info">
                                        <h3>{item.title}</h3>
                                        <p>{item.value}</p>
                                        {item.large && <span>Ачивка</span>}
                                    </div>
                                    <div className="curricular-charge-points">
                                        <span>+3</span>
                                        <img src={item.icon} alt="" />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            <Navbar />
        </main>
    );
}
