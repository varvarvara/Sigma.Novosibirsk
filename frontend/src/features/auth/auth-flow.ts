import { redirect } from '@tanstack/react-router'
import type { RoleId } from './role-options'

export type AuthIntent = 'register' | 'login'

const AUTH_SELECTED_ROLE_STORAGE_KEY = 'sigma.auth.selectedRole'

function isRoleId(value: unknown): value is RoleId {
  return value === 'student' || value === 'teacher' || value === 'organizer'
}

/** Сохраняет роль, выбранную на шаге «Кто вы?» */
export function persistAuthSelectedRole(role: RoleId) {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.setItem(AUTH_SELECTED_ROLE_STORAGE_KEY, role)
}

/** Роль из state навигации или sessionStorage */
export function readAuthSelectedRole(locationState?: unknown): RoleId | null {
  const fromState = (locationState as { role?: unknown } | undefined)?.role
  if (isRoleId(fromState)) {
    return fromState
  }

  if (typeof window === 'undefined') {
    return null
  }

  const stored = sessionStorage.getItem(AUTH_SELECTED_ROLE_STORAGE_KEY)
  return isRoleId(stored) ? stored : null
}

export const AUTH_MOBILE_MAX_WIDTH_PX = 768

const MOBILE_MAX_WIDTH_PX = AUTH_MOBILE_MAX_WIDTH_PX

export function parseAuthIntent(search: Record<string, unknown>): AuthIntent {
  return search.intent === 'register' ? 'register' : 'login'
}

export function isMobileAuthViewport() {
  if (typeof window === 'undefined') {
    return false
  }

  const viewportWidth = window.visualViewport?.width ?? window.innerWidth

  if (viewportWidth <= MOBILE_MAX_WIDTH_PX) {
    return true
  }

  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches
}

/** Всегда /role: на десктопе router перенаправит на /select-role */
export function getRoleSelectionNavigateOptions(intent: AuthIntent) {
  return { to: '/role' as const, search: { intent } }
}

/** На узком экране /select-role всегда открывает мобильную страницу /role */
export function redirectMobileSelectRoleToRole(search: Record<string, unknown>) {
  if (!isMobileAuthViewport()) {
    return
  }

  throw redirect({
    to: '/role',
    search: { intent: parseAuthIntent(search) },
  })
}

/** На широком экране /role открывает десктопную страницу /select-role */
export function redirectDesktopRoleToSelectRole(search: Record<string, unknown>) {
  if (isMobileAuthViewport()) {
    return
  }

  throw redirect({
    to: '/select-role',
    search: { intent: parseAuthIntent(search) },
  })
}

export function navigateAfterRoleSelection(
  intent: AuthIntent,
  role: RoleId,
  navigate: (options: { to: string; state?: { role: string } }) => void,
) {
  persistAuthSelectedRole(role)

  if (intent === 'login') {
    navigate({ to: '/login', state: { role } })
    return
  }

  if (role === 'student') {
    navigate({ to: '/setup-student' })
    return
  }

  if (role === 'teacher') {
    navigate({ to: '/setup-teacher' })
    return
  }

  navigate({ to: '/login', state: { role: 'organizer' } })
}

/** Регистрация с учётом роли, уже выбранной на «Кто вы?» (без повторного выбора) */
export function navigateToRegistration(
  navigate: (options: { to: string; state?: { role: string } }) => void,
  locationState?: unknown,
) {
  const role = readAuthSelectedRole(locationState)

  if (role === 'student' || role === 'teacher') {
    navigateAfterRoleSelection('register', role, navigate)
    return
  }

  navigate(getRoleSelectionNavigateOptions('register'))
}
