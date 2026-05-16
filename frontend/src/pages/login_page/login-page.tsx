import { Link } from "@tanstack/react-router";
import "./login-page.css";

export function LoginPage() {
    return (
        <main className="login-page">
            <div className="login-split">
                <div className="login-left">
                    <div className="login-card">
                        <div className="login-header">
                            <h1 className="login-title">Вход в аккаунт</h1>
                            <p className="login-subtitle">Добро пожаловать! Пожалуйста, введите свои данные.</p>
                        </div>

                        <form className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" placeholder="Введите email..." required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Пароль</label>
                                <input type="password" id="password" placeholder="••••••••" required />
                            </div>

                            <div className="form-actions">
                                <label className="checkbox-container">
                                    <input type="checkbox" />
                                    <span>Запомнить меня</span>
                                </label>
                                
                                <a href="/forgot-password" className="forgot-password">Забыли пароль?</a>
                            </div>

                            <button type="submit" className="login-button">Войти</button>
                        </form>

                        <p className="login-footer">
                            Нет аккаунта? <Link to="/select-role" className="register-link">Зарегистрироваться</Link>
                        </p>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-gradient"></div>
                    <svg
                        className="login-star-big"
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