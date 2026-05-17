import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import "./select-role-page.css";

type RoleType = 'student' | 'teacher' | 'organizer' | null;

const ROLES = [
    { id: 'student' as const, name: 'Ученик', subtitle: '9-11 класс', description: 'описание', image: '/role-student.png' },
    { id: 'teacher' as const, name: 'Преподаватель', subtitle: 'с 1 курса', description: 'описание', image: '/role-teacher.png' },
    { id: 'organizer' as const, name: 'Организатор', subtitle: 'бесценный', description: 'описание', image: '/role-organizer.png' },
];

export function SelectRolePage() {
    const [selectedRole, setSelectedRole] = useState<RoleType>(null);
    const navigate = useNavigate();

    const handleConfirm = () => {
        if (!selectedRole) return;

        switch (selectedRole) {
            case 'student':
                navigate({ to: '/setup-student' });
                break;
            case 'teacher':
                navigate({ to: '/setup-teacher' });
                break;
            case 'organizer':
                // TODO: Реализовать флоу организатора
                break;
        }
    };

    return (
        <main className="select-role-page">
            <div className="select-role-wrapper">
                <header className="select-role-intro">
                    <h1 className="select-role-welcome">Добро пожаловать на Сигму!</h1>
                    <p className="select-role-description">
                        Школа «Сигма» — это бесплатная летняя школа с авторскими и
                        олимпиадными курсами о науке и жизни для учеников 9-11 классов. В этом
                        году Сигма проводит свой 4 сезон при НГУ в Новосибирском Академгородке
                        23-30 июля
                    </p>
                </header>

                <div className="select-role-header">
                    <h2 className="select-role-title">Кто вы?</h2>
                    <p className="select-role-subtitle">Выберите одну из категорий</p>
                </div>

                <div className="role-options">
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                            onClick={() => setSelectedRole(role.id as RoleType)}
                            type="button"
                        >
                            <img src={role.image} alt={role.name} className="role-avatar" />
                            <div className="role-text">
                                <h3 className="role-name">{role.name}</h3>
                                <p className="role-subtitle">{role.subtitle}</p>
                                <p className="role-description">{role.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="role-actions">
                    <button
                        className="action-button action-button-primary"
                        type="button"
                        onClick={() => navigate({ to: '/login' })}
                    >
                        Войти
                    </button>
                    <button
                        className={`action-button action-button-secondary ${selectedRole ? 'active' : ''}`}
                        type="button"
                        onClick={handleConfirm}
                        disabled={!selectedRole}
                    >
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </main>
    );
}
