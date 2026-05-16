import React from 'react';
import { Link } from '@tanstack/react-router';
import './profile-page.css';
import { Navbar } from "../../widgets/navbar/navbar";

export function ProfilePage() {
    return (
        <div className="profile-page-wrapper">
            <div className="profile-container">
                {/* Шапка профиля */}
                <header className="profile-header">
                    <div className="header-placeholder"></div>
                    <h1 className="profile-title">Профиль</h1>
                    <button className="settings-btn" aria-label="Настройки">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12.7168 2.0001C13.4731 2.0001 14.158 2.42017 14.5362 3.04014C14.7201 3.34003 14.8431 3.70986 14.8125 4.09971C14.7921 4.39971 14.8834 4.70057 15.0469 4.98057C15.5682 5.83045 16.7238 6.14999 17.6231 5.67002C18.6347 5.09037 19.9116 5.44014 20.4942 6.42979L21.1787 7.61045C21.7714 8.60043 21.4448 9.87055 20.4229 10.4405C19.5543 10.9506 19.2474 12.0806 19.7686 12.9405C19.9321 13.2104 20.1163 13.4402 20.4024 13.5802C20.7601 13.7702 21.0363 14.0702 21.2305 14.3702C21.6084 14.9901 21.5778 15.7501 21.21 16.42L20.4942 17.6202C20.116 18.2601 19.4111 18.6602 18.6856 18.6603C18.3281 18.6603 17.9295 18.5603 17.6026 18.3605C17.3369 18.1905 17.0301 18.13 16.7032 18.13C15.6914 18.13 14.8432 18.9603 14.8125 19.9503C14.8124 21.1 13.8723 21.9999 12.6973 22.0001H11.3067C10.1214 22 9.18178 21.1001 9.18168 19.9503C9.16124 18.9603 8.31256 18.13 7.30082 18.13C6.9636 18.13 6.65688 18.1905 6.4014 18.3605C6.07446 18.5603 5.66574 18.6602 5.3184 18.6603C4.5826 18.6603 3.87719 18.2602 3.49906 17.6202L2.79398 16.42C2.41594 15.7701 2.39546 14.9902 2.77348 14.3702C2.93694 14.0703 3.24351 13.7702 3.59086 13.5802C3.87696 13.4402 4.06168 13.2105 4.23539 12.9405C4.74637 12.0805 4.43901 10.9505 3.57035 10.4405C2.55879 9.87055 2.23221 8.60037 2.81449 7.61045L3.49906 6.42979C4.0918 5.43998 5.35903 5.09022 6.3809 5.67002C7.26989 6.14996 8.42504 5.83034 8.94633 4.98057C9.10984 4.70057 9.20212 4.39971 9.18168 4.09971C9.16133 3.70984 9.2737 3.34004 9.46781 3.04014C9.84595 2.42022 10.5304 2.0201 11.2764 2.0001H12.7168ZM12.0118 9.17979C10.4075 9.17997 9.10954 10.4401 9.10941 12.0099C9.10941 13.5797 10.4074 14.83 12.0118 14.8302C13.6162 14.8302 14.8838 13.5799 14.8838 12.0099C14.8837 10.44 13.6161 9.17979 12.0118 9.17979Z" fill="#101828"/>
                        </svg>
                    </button>
                </header>

                {/* Основная информация о пользователе */}
                <section className="user-main-info">
                    <div className="avatar-wrapper">
                        {/* Заглушка для аватарки с инициалами, либо ставим картинку */}
                        <div className="avatar-fallback">АВ</div>
                    </div>
                    <div className="user-text-info">
                        <h2 className="user-name">Аня Волкова</h2>
                        <p className="user-role-team">Ученица &bull; Команда 5</p>
                    </div>
                </section>

                {/* Статистика / Баллы */}
                <section className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper flash-icon">
                            <span className="emoji-icon">⚡</span>
                        </div>
                        <div className="stat-value">13</div>
                        <div className="stat-label">учебных<br/>баллов</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper star-icon">
                            <span className="emoji-icon">⭐</span>
                        </div>
                        <div className="stat-value">11</div>
                        <div className="stat-label">внеучебных<br/>баллов</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper coin-icon">
                            <span className="emoji-icon">💰</span>
                        </div>
                        <div className="stat-value">300</div>
                        <div className="stat-label">SigmaCoins</div>
                    </div>
                </section>

                {/* Навигационное меню списка */}
                <nav className="profile-menu">
                    <Link to="/attendance" className="menu-item">
                        <span className="menu-text">Посещаемость</span>
                        <ChevronRightIcon />
                    </Link>
                    <Link to="/schedule" className="menu-item">
                        <span className="menu-text">Мое расписание</span>
                        <ChevronRightIcon />
                    </Link>
                    <Link to="/achievements" className="menu-item">
                        <span className="menu-text">Достижения</span>
                        <ChevronRightIcon />
                    </Link>
                    <Link to="/certificates" className="menu-item">
                        <span className="menu-text">Сертификаты</span>
                        <ChevronRightIcon />
                    </Link>
                </nav>

                <section className="activities-section">
                    <h2 className="activities-title">Мои активности</h2>

                    <div className="activities-list">
                        <div className="activity-card">
                            <img className="activity-image" src="/star.png" alt="" />

                            <div className="activity-info">
                                <h3>Учебная активность</h3>
                                <Link to="/scores">Посмотреть начисления</Link>
                                <Link to="/achievements">Посмотреть ачивки</Link>
                            </div>
                        </div>

                        <div className="activity-card">
                            <img className="activity-image" src="/flash.png" alt="" />

                            <div className="activity-info">
                                <h3>Внеучебка</h3>
                                <p className="team-name">Название команды</p>
                                <Link to="/scores">Посмотреть начисления</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <Navbar />
            </div>
        </div>
    );
}

// Компонент-иконка стрелочки вправо для пунктов меню
function ChevronRightIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
