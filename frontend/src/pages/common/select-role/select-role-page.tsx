import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AUTH_ROLE_OPTIONS, SIGMA_INTRO_TEXT, type RoleId } from '../../../features/auth/role-options'
import {
  isMobileAuthViewport,
  navigateAfterRoleSelection,
  parseAuthIntent,
  type AuthIntent,
} from '../../../features/auth/auth-flow'
import { RolePage } from '../role/role-page'
import '../../../styles/auth-buttons.css'
import './select-role-page.css'

export function SelectRolePage() {
  if (isMobileAuthViewport()) {
    return <RolePage />
  }

  return <SelectRoleDesktopPage />
}

function SelectRoleDesktopPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { intent?: AuthIntent }
  const intent = parseAuthIntent(search)
  const isRegister = intent === 'register'

  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null)
  const [organizerNotice, setOrganizerNotice] = useState<string | null>(null)

  const visibleRoles = useMemo(
    () => (isRegister ? AUTH_ROLE_OPTIONS.filter((role) => role.id !== 'organizer') : AUTH_ROLE_OPTIONS),
    [isRegister],
  )

  const handleContinue = () => {
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

  return (
    <main className="select-role-page">
      <div className="select-role-wrapper">
        <header className="select-role-intro">
          <h1 className="select-role-welcome">Добро пожаловать на Сигму!</h1>
          <p className="select-role-description">{SIGMA_INTRO_TEXT}</p>
        </header>

        <div className="select-role-header">
          <h2 className="select-role-title">Кто вы?</h2>
          <p className="select-role-subtitle">
            {isRegister ? 'Выберите роль для регистрации' : 'Выберите роль для входа'}
          </p>
        </div>

        <div className="select-role-options">
          {visibleRoles.map((role) => (
            <button
              key={role.id}
              className={`select-role-card ${selectedRole === role.id ? 'select-role-card--selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
              type="button"
            >
              <span className="select-role-card__emoji" aria-hidden>
                {role.emoji}
              </span>
              <div className="select-role-card__text">
                <h3 className="select-role-card__name">{role.name}</h3>
                <p className="select-role-card__subtitle">{role.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {organizerNotice ? <p className="select-role-notice">{organizerNotice}</p> : null}

        <div className="select-role-actions">
          <button
            type="button"
            className="auth-btn auth-btn--primary auth-btn--block select-role-continue"
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            {isRegister ? 'Продолжить' : 'Войти'}
          </button>
        </div>
      </div>
    </main>
  )
}
