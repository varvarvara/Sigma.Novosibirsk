import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthBackButton } from '../../../components/auth/auth-back-button'
import {
  navigateAfterRoleSelection,
  parseAuthIntent,
  type AuthIntent,
} from '../../../features/auth/auth-flow'
import { AUTH_ROLE_OPTIONS, type RoleId } from '../../../features/auth/role-options'
import './role-page.css'

export function RolePage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { intent?: AuthIntent }
  const intent = parseAuthIntent(search)
  const isRegister = intent === 'register'
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null)
  const [organizerNotice, setOrganizerNotice] = useState<string | null>(null)

  const visibleRoleOptions = useMemo(
    () => (isRegister ? AUTH_ROLE_OPTIONS.filter((role) => role.id !== 'organizer') : AUTH_ROLE_OPTIONS),
    [isRegister],
  )

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

    if (!isRegister && selectedRole === 'organizer') {
      setOrganizerNotice(
        'Учётные записи организаторов выдаются администрацией. Войдите с выданными данными.',
      )
    } else {
      setOrganizerNotice(null)
    }

    navigateAfterRoleSelection(intent, selectedRole, navigate)
  }

  const handleSelectRole = (roleId: RoleId) => {
    setSelectedRole((prev) => (prev === roleId ? null : roleId))
    if (organizerNotice) {
      setOrganizerNotice(null)
    }
  }

  const confirmLabel = (() => {
    if (!selectedRole) {
      return 'Выберите роль'
    }
    if (isRegister) {
      return 'Подтвердить выбор'
    }
    return 'Войти'
  })()

  return (
    <main className="role-page">
      <AuthBackButton
        fallback={{ to: '/' }}
        className="role-page__back app-back-button"
        iconClassName="role-page__back-icon app-back-button__icon"
      />

      <header className="role-page__header">
        <h1 className="role-page__title">Кто вы?</h1>
        <p className="role-page__subtitle">
          {isRegister ? 'Выберите роль для регистрации' : 'Выберите роль для входа'}
        </p>
      </header>

      <section className="role-page__list" aria-label="Выбор роли">
        {visibleRoleOptions.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`role-page__card${selectedRole === role.id ? ' role-page__card--active' : ''}`}
            onClick={() => handleSelectRole(role.id)}
          >
            <span className="role-page__card-emoji" aria-hidden>
              {role.emoji}
            </span>
            <span className="role-page__card-body">
              <span className="role-page__card-label">{role.name}</span>
              <span className="role-page__card-description">{role.subtitle}</span>
            </span>
          </button>
        ))}
      </section>

      {organizerNotice ? <p className="role-page__notice">{organizerNotice}</p> : null}

      <button
        type="button"
        className="role-page__confirm"
        onClick={handleConfirm}
        disabled={!selectedRole}
      >
        {confirmLabel}
      </button>
    </main>
  )
}
