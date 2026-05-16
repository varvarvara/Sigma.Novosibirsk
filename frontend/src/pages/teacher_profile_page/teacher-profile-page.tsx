import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../../shared/ui/Button/Button';
import { Card } from '../../shared/ui/Card/Card';
import { Sidebar } from '../../shared/ui/Sidebar/Sidebar';

const CoursesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 13.18V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V13.18L12 10.46L5 13.18ZM12 8L19.53 11.47C19.81 11.6 20 11.9 20 12.22V3L12 0L4 3V12.22C4 12.5 4.19 12.8 4.47 12.93L12 8Z" fill="currentColor"/>
    </svg>
);

const ScheduleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V15H9V17ZM9 13H7V11H9V13ZM9 9H7V7H9V9ZM13 17H11V15H13V17ZM13 13H11V11H13V13ZM13 9H11V7H13V9ZM17 17H15V15H17V17ZM17 13H15V11H17V13ZM17 9H15V7H17V9Z" fill="currentColor"/>
    </svg>
);

const StudentsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM6 10C7.657 10 8.985 8.672 8.985 7C8.985 5.328 7.657 4 6 4C4.343 4 3 5.328 3 7C3 8.672 4.343 10 6 10ZM6 11C3.67 11 1 12.17 1 14V16H11V14C11 12.17 8.33 11 6 11ZM15 13C12.33 13 9 14.17 9 16V19H21V16C21 14.17 17.67 13 15 13Z" fill="currentColor"/>
    </svg>
);

const ProfileIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
    </svg>
);

const navItems = [
    { id: 'courses', label: 'Мои курсы', path: '/teacher/courses', icon: <CoursesIcon /> },
    { id: 'schedule', label: 'Мое расписание', path: '/teacher/schedule', icon: <ScheduleIcon /> },
    { id: 'students', label: 'Студенты', path: '/teacher/students', icon: <StudentsIcon /> },
    { id: 'profile', label: 'Профиль', path: '/teacher/profile', icon: <ProfileIcon /> },
];

export function TeacherProfilePage() {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFBFC' }}>
            <Sidebar items={navItems} activePath="/teacher/profile" />
            <main style={{ flex: 1, padding: '40px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
                    <h1 style={{ margin: '0 0 32px 0', fontSize: '30px', color: '#101828' }}>Мой профиль</h1>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <Card>
                            <h3 style={{ marginTop: 0, borderBottom: '1px solid #EAECF0', paddingBottom: '16px' }}>Личная информация</h3>
                            <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', color: '#667085', fontSize: '14px' }}>ФИО</p>
                                    <p style={{ margin: 0, color: '#101828', fontWeight: 500 }}>Иванов Иван Иванович</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', color: '#667085', fontSize: '14px' }}>О себе</p>
                                    <p style={{ margin: 0, color: '#101828' }}>Преподаватель по Computer Science. 10 лет опыта в индустрии.</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', color: '#667085', fontSize: '14px' }}>Контакты</p>
                                    <p style={{ margin: 0, color: '#101828' }}>+7 (999) 123-45-67 <br/> @ivanov_dev</p>
                                </div>
                            </div>
                        </Card>

                        <Card style={{ backgroundColor: '#F9F5FF', borderColor: '#D6BBFB' }}>
                            <h3 style={{ marginTop: 0, color: '#42307D', marginBottom: '16px' }}>Летняя школа 2026</h3>
                            <p style={{ color: '#6941C6', marginBottom: '24px', fontSize: '14px' }}>Сертификат преподавателя готов!</p>
                            <Button variant="primary" style={{ width: '100%', fontSize: '14px', padding: '10px 16px' }}>
                                Скачать (PDF)
                            </Button>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
