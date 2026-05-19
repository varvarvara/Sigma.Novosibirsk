import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getCurrentStudent, isStaffProfile } from '../../../api/students/profile';
import {
  getOrgProfileSyncDetail,
  ORG_AVATAR_UPDATED_EVENT,
  ORG_DEFAULT_AVATAR_SRC,
  ORG_LOGO_SRC,
  ORG_PROFILE_UPDATED_EVENT,
  persistOrgAvatarUrl,
} from '../../org-profile-events';
import './org-sidebar-styles.css';
import { readOrgAvatar, useOrgAvatar } from './use-org-avatar';

type OrgSidebarProps = {
  avatarSrc?: string | null;
};

const ICONS = {
  users: '/org/sidebar/users.svg?v=2',
  calendar: '/org/sidebar/calendar.svg?v=2',
  courses: '/org/sidebar/courses.svg?v=2',
  teams: '/org/sidebar/teams.svg?v=3',
} as const;

function SidebarIcon({ src }: { src: string }) {
  return <img className="org-sidebar__icon" src={src} alt="" draggable={false} />;
}

const EXTRACURRICULAR_PATHS = [
  '/org-extracurricular',
  '/org-extracurricular-creation',
  '/extracurricular-points-add',
  '/team-formation',
  '/team-creation',
] as const;

export function OrgSidebar({ avatarSrc }: OrgSidebarProps) {
  const { pathname } = useLocation();
  const [shellAvatarSrc, setShellAvatarSrc] = useState<string | undefined>(() =>
    avatarSrc !== undefined && avatarSrc !== null ? avatarSrc : undefined,
  );

  useEffect(() => {
    if (avatarSrc !== undefined && avatarSrc !== null) {
      setShellAvatarSrc(avatarSrc);
    }
  }, [avatarSrc]);

  useEffect(() => {
    if (avatarSrc !== undefined) {
      return;
    }

    let cancelled = false;

    const loadAvatar = async () => {
      try {
        const user = await getCurrentStudent();
        if (cancelled || !isStaffProfile(user)) {
          return;
        }

        const nextAvatar = user.avatar_url ?? ORG_DEFAULT_AVATAR_SRC;
        persistOrgAvatarUrl(user.avatar_url);
        setShellAvatarSrc(nextAvatar);
      } catch {
        if (!cancelled) {
          setShellAvatarSrc(readOrgAvatar());
        }
      }
    };

    void loadAvatar();

    return () => {
      cancelled = true;
    };
  }, [avatarSrc]);

  useEffect(() => {
    const handleProfileSync = (event: Event) => {
      const detail = getOrgProfileSyncDetail(event);
      if (detail?.avatarUrl !== undefined) {
        setShellAvatarSrc(detail.avatarUrl || ORG_DEFAULT_AVATAR_SRC);
        return;
      }

      if (avatarSrc === undefined) {
        setShellAvatarSrc(readOrgAvatar());
      }
    };

    window.addEventListener(ORG_AVATAR_UPDATED_EVENT, handleProfileSync);
    window.addEventListener(ORG_PROFILE_UPDATED_EVENT, handleProfileSync);

    return () => {
      window.removeEventListener(ORG_AVATAR_UPDATED_EVENT, handleProfileSync);
      window.removeEventListener(ORG_PROFILE_UPDATED_EVENT, handleProfileSync);
    };
  }, [avatarSrc]);

  const resolvedAvatarOverride = avatarSrc !== undefined ? avatarSrc : shellAvatarSrc;
  const avatar = useOrgAvatar(resolvedAvatarOverride);

  const isActive = (paths: string[]) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const itemClass = (paths: string[]) => `org-sidebar__item${isActive(paths) ? ' is-active' : ''}`;

  return (
    <aside className="org-sidebar" aria-label="Навигация">
      <div className="org-sidebar__logo" aria-hidden="true">
        <img className="org-sidebar__logo-img" src={ORG_LOGO_SRC} alt="Sigma" draggable={false} />
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
        <Link
          to="/org-profile"
          className={`org-sidebar__avatar${isActive(['/org-profile']) ? ' is-active' : ''}`}
          aria-label="Профиль"
        >
          <img
            src={avatar}
            alt=""
            draggable={false}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = ORG_DEFAULT_AVATAR_SRC;
            }}
          />
        </Link>
      </div>
    </aside>
  );
}
