import { Link } from "@tanstack/react-router";
import "./welcome-page.css";

export function WelcomePage() {
    return (
        <main className="welcome-page">
            <div className="welcome-split">
                <div className="welcome-left">
                    <div className="welcome-content">
                        <h1 className="welcome-title">Добро пожаловать в Сигму</h1>
                        <p className="welcome-subtitle">Платформа для летней научно-образовательной школы</p>

                        <div className="welcome-buttons">
                            <Link to="/select-role" className="btn btn-primary">
                                Зарегистрироваться
                            </Link>
                            <Link to="/login" className="btn btn-secondary">
                                Войти
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="welcome-right">
                    <div className="welcome-gradient"></div>
                    <svg
                        className="welcome-star-big"
                        width="1743"
                        height="1495"
                        viewBox="0 0 1743 1495"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid slice"
                    >
                        <path
                            d="M1380.46 182.716L1163.74 721.736L1742.41 936.883L1146.85 867.444L1134.64 1494.81L1005.22 872.481L0.00388986 1290.94L924.916 726.314L283.959 -0.000298724L1053.56 645.901L1380.46 182.716Z"
                            fill="#7949FF"
                            fillOpacity="0.5"
                        />
                    </svg>
                </div>
            </div>
        </main>
    );
}