import { Link, useLocation } from '@tanstack/react-router'
import './org-sidebar-styles.css'
import { useOrgAvatar } from './use-org-avatar'

const ORG_LOGO_SRC = '/org/sigma-logomark.svg?v=4'

type OrgSidebarProps = {
  avatarSrc?: string | null
}

const ICONS = {
  users: '/org/sidebar/users.svg?v=2',
  calendar: '/org/sidebar/calendar.svg?v=2',
  courses: '/org/sidebar/courses.svg?v=2',
  teams: '/org/sidebar/teams.svg?v=3',
  settings: '/org/sidebar/settings.svg?v=2',
} as const

function SidebarIcon({ src }: { src: string }) {
  return <img className="org-sidebar__icon" src={src} alt="" draggable={false} />
}

const EXTRACURRICULAR_PATHS = [
  '/org-extracurricular',
  '/org-extracurricular-creation',
  '/extracurricular-points-add',
  '/team-formation',
  '/team-creation',
] as const

export function OrgSidebar({ avatarSrc }: OrgSidebarProps) {
  const { pathname } = useLocation()
  const avatar = useOrgAvatar(avatarSrc ?? undefined)

  const isActive = (paths: string[]) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  const itemClass = (paths: string[]) => `org-sidebar__item${isActive(paths) ? ' is-active' : ''}`

  return (
    <aside className="org-sidebar" aria-label="Навигация">
      <div className="org-sidebar__logo" aria-hidden="true">
        <img className="org-sidebar__icon" src={ORG_LOGO_SRC} alt="" draggable={false} />
      </div>

      <nav className="org-sidebar__nav">
        <Link
          to="/org-users-stub"
          className={itemClass(['/org-users-stub'])}
          aria-label="Участники"
        >
          <SidebarIcon src={ICONS.users} />
        </Link>
        <Link
          to="/org-schedule-stub"
          className={itemClass(['/org-schedule-stub'])}
          aria-label="Расписание"
        >
          <SidebarIcon src={ICONS.calendar} />
        </Link>
        <Link
          to="/org-courses-stub"
          className={itemClass(['/org-courses-stub'])}
          aria-label="Курсы"
        >
          <SidebarIcon src={ICONS.courses} />
        </Link>
        <Link
          to="/org-extracurricular"
          className={itemClass([...EXTRACURRICULAR_PATHS])}
          aria-label="Внеучебная деятельность"
        >
          <SidebarIcon src={ICONS.teams} />
        </Link>
      </nav>

      <div className="org-sidebar__footer">
        <div className="org-sidebar__divider" aria-hidden />
        <button type="button" className={itemClass([])} aria-label="Настройки">
          <SidebarIcon src={ICONS.settings} />
        </button>
        <Link
          to="/org-profile"
          className={`org-sidebar__avatar${isActive(['/org-profile']) ? ' is-active' : ''}`}
          aria-label="Профиль"
        >
          <img src={avatar} alt="" draggable={false} />
        </Link>
      </div>
    </aside>
  )
}
