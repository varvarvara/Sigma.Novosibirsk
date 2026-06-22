import { Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { AuthApiError } from "../../../entities/auth";
import { useMyExtracurricularQuery } from "../../../entities/student/queries/extracurricular.queries";
import "./extracurricular-page.css";

const RATING_ICONS: Record<number, string> = {
    1: "/raster-icons/rating-1.png",
    2: "/raster-icons/rating-2.png",
    3: "/raster-icons/rating-3.png",
};

function formatCoins(value: number) {
    return value > 0 ? `+${value}` : String(value);
}

export function ExtracurricularPage() {
    const { hash } = useLocation();
    const { data: dashboard, isLoading, error } = useMyExtracurricularQuery();

    useEffect(() => {
        if (hash === "charges") {
            document.getElementById("charges")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [hash, dashboard]);

    const errorMessage =
        error instanceof AuthApiError
            ? error.message
            : error
                ? "Не удалось загрузить данные внеучебки"
                : null;

    const myTeam = dashboard?.my_team;
    const rating = dashboard?.rating ?? [];
    const charges = dashboard?.charges ?? [];
    const showTeamCard = Boolean(dashboard?.has_team && myTeam);
    const showCharges = showTeamCard;
    const showEmpty =
        !isLoading && (Boolean(errorMessage) || (rating.length === 0 && !showTeamCard));

    return (
        <main className="extracurricular-page">
            <header className="extracurricular-header">
                <Link className="back-button app-back-button app-back-button--dark" to="/profile" aria-label="Назад">
                    <ChevronLeft className="app-back-button__icon" size={24} color="#F7F6FA" />
                </Link>
                <h1>Внеучебка // Внеучебная активность</h1>
            </header>

            <div className="extracurricular-content">
                {isLoading ? <p className="extracurricular-status">Загрузка...</p> : null}
                {showEmpty ? (
                    <p className="extracurricular-empty">Информации по внеучебной активности нет</p>
                ) : null}

                {!showEmpty && !isLoading ? (
                    <>
                        {showTeamCard && myTeam ? (
                            <section className="team-card">
                                <div className="team-content">
                                    <div className="team-text">
                                        <h1>{myTeam.team_name}</h1>
                                        <div className="team-members">
                                            {myTeam.members.map((member) => (
                                                <p key={member.student_id}>{member.full_name}</p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="team-stats">
                                        <div>
                                            <img src="/raster-icons/sigmacoins.png" alt="" />
                                            <p>
                                                <span>{myTeam.total_coins}</span> сигмакоинов
                                            </p>
                                        </div>
                                        {myTeam.rating_place != null ? (
                                            <div>
                                                <img src="/raster-icons/rating-place.png" alt="" />
                                                <p>
                                                    <span>{myTeam.rating_place}</span> место в рейтинге
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </section>
                        ) : null}

                        {rating.length > 0 ? (
                            <section className="rating-panel">
                                <h2>Рейтинг</h2>
                                <div className="rating-list">
                                    {rating.map((team) => (
                                        <article className="activity-row" key={team.team_id}>
                                            <div className="rating-place">
                                                <span>{team.place}</span>
                                                {RATING_ICONS[team.place] ? (
                                                    <img src={RATING_ICONS[team.place]} alt="" />
                                                ) : null}
                                            </div>
                                            <div className="rating-info">
                                                <h3>{team.team_name}</h3>
                                                <p>{team.members_label}</p>
                                                <p className="rating-coins">{team.total_coins} сигмакоинов</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {showCharges ? (
                            <section className="charges-panel" id="charges">
                                <div className="charges-panel__header">
                                    <h2>Начисления</h2>
                                    {myTeam ? <span>Итого: {myTeam.total_coins} сигмакоинов</span> : null}
                                </div>

                                {charges.length === 0 ? (
                                    <p className="extracurricular-status">Начислений по вашей команде пока нет</p>
                                ) : (
                                    <div className="charges-list">
                                        {charges.map((charge) => (
                                            <article className="charge-row" key={charge.id}>
                                                <div className="charge-info">
                                                    <h3>{charge.activity_name}</h3>
                                                    <p>
                                                        Команда «{myTeam?.team_name}» · начислено всем участникам
                                                    </p>
                                                    <p className="charge-info__student-delta">
                                                        В личный счёт студента: {formatCoins(charge.coins)}
                                                    </p>
                                                </div>
                                                <div className="charge-coins">
                                                    <span>{formatCoins(charge.coins)}</span>
                                                    <img src="/raster-icons/sigmacoins.png" alt="" />
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ) : null}
                    </>
                ) : null}
            </div>
        </main>
    );
}
