import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from '@untitledui/icons/ChevronLeft'
import './role-page.css'

const roleOptions = [
  { id: 'student', label: 'Ученик' },
  { id: 'teacher', label: 'Преподаватель' },
  { id: 'organizer', label: 'Организатор' },
] as const

export function RolePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const authIntent =
    (location.state as { authIntent?: 'login' | 'register' } | undefined)?.authIntent ?? 'login'
  const visibleRoleOptions =
    authIntent === 'register' ? roleOptions.filter((role) => role.id !== 'organizer') : roleOptions

  useEffect(() => {
    if (!selectedRole) {
      return
    }

    const isStillVisible = visibleRoleOptions.some((role) => role.id === selectedRole)
    if (!isStillVisible) {
      setSelectedRole(null)
    }
  }, [selectedRole, visibleRoleOptions])

  const handleConfirm = () => {
    if (!selectedRole) {
      return
    }

    if (authIntent === 'login') {
      navigate({ to: '/login', state: { role: selectedRole } })
      return
    }

    navigate({ to: '/register', state: { role: selectedRole } })
  }

  const handleSelectRole = (roleId: string) => {
    setSelectedRole((prev) => (prev === roleId ? null : roleId))
  }

  return (
    <main className="role-page">
      <button
        type="button"
        className="role-page__back app-back-button"
        aria-label="Назад"
        onClick={() => navigate({ to: '/enter' })}
      >
        <ChevronLeft className="role-page__back-icon app-back-button__icon" size={24} color="#2A2730" />
      </button>

      <header className="role-page__header">
        <h1 className="role-page__title">Кто вы?</h1>
        <p className="role-page__subtitle">Выберите одну категорию</p>
      </header>

      <section className="role-page__list" aria-label="Выбор роли">
        {visibleRoleOptions.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`role-card${selectedRole === role.id ? ' role-card--active' : ''}`}
            onClick={() => handleSelectRole(role.id)}
          >
            <span className="role-card__placeholder" aria-hidden="true" />
            <span className="role-card__label">{role.label}</span>
          </button>
        ))}
      </section>

      <button
        type="button"
        className="role-page__confirm"
        onClick={handleConfirm}
        disabled={!selectedRole}
      >
        {selectedRole ? 'Подтвердить выбор' : 'Выберите роль'}
      </button>
    </main>
  )
}
