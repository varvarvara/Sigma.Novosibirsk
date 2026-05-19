import { Link, useLocation } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { clearAuthTokens, getAccessToken, getRefreshToken, logout } from '../../../api/auth';
import { getCurrentStudent, isStaffProfile } from '../../../api/students/profile';
import { getTeacherFullName } from '../../../features/teacher/teacher-profile';
import {
  getTeacherProfileSyncDetail,
  TEACHER_AVATAR_UPDATED_EVENT,
  TEACHER_PROFILE_UPDATED_EVENT,
  type TeacherProfileSyncDetail,
} from '../../teacher-profile-events';
import {
  isTeacherSubnavItemActive,
  type TeacherNavSection,
  TEACHER_NAV_SECTIONS,
} from './teacher-nav-config';
import { useTeacherAvatar } from './use-teacher-avatar';

type TeacherSubnavPanelProps = {
  section: TeacherNavSection | null;
  isOpen: boolean;
  avatarSrc?: string | null;
};

function applyTeacherProfileSyncDetail(
  detail: TeacherProfileSyncDetail | undefined,
  setDisplayName: (name: string) => void,
  setDisplayEmail: (email: string) => void,
) {
  if (!detail) {
    return false;
  }

  let applied = false;

  if (detail.firstName !== undefined || detail.lastName !== undefined || detail.patronymic !== undefined) {
    const fullName = getTeacherFullName({
      firstName: detail.firstName ?? '',
      lastName: detail.lastName ?? '',
      patronymic: detail.patronymic ?? '',
      email: '',
    });

    if (fullName) {
      setDisplayName(fullName);
      applied = true;
    }
  }

  if (detail.email) {
    setDisplayEmail(detail.email);
    applied = true;
  }

  return applied;
}

export function TeacherSubnavPanel({ section, isOpen, avatarSrc }: TeacherSubnavPanelProps) {
  const location = useLocation();
  const [displayName, setDisplayName] = useState('Имя фамилия');
  const [displayEmail, setDisplayEmail] = useState('teacher@sigma.ru');
  const resolvedAvatarSrc = useTeacherAvatar(avatarSrc);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const user = await getCurrentStudent();
      if (!isStaffProfile(user)) {
        return;
      }

      const mapped = {
        firstName: user.first_name,
        lastName: user.last_name,
        patronymic: user.partonymic ?? '',
        email: user.email,
      };

      const fullName = getTeacherFullName(mapped);
      setDisplayName(fullName || 'Имя фамилия');
      setDisplayEmail(user.email);
    } catch {
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleAvatarSync = () => {
      void loadUser();
    };

    const handleProfileSync = (event: Event) => {
      const detail = getTeacherProfileSyncDetail(event);
      applyTeacherProfileSyncDetail(detail, setDisplayName, setDisplayEmail);
      void loadUser();
    };

    window.addEventListener(TEACHER_AVATAR_UPDATED_EVENT, handleAvatarSync);
    window.addEventListener(TEACHER_PROFILE_UPDATED_EVENT, handleProfileSync);

    return () => {
      window.removeEventListener(TEACHER_AVATAR_UPDATED_EVENT, handleAvatarSync);
      window.removeEventListener(TEACHER_PROFILE_UPDATED_EVENT, handleProfileSync);
    };
  }, [loadUser]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    try {
      if (accessToken || refreshToken) {
        await logout({ refresh_token: refreshToken }, accessToken);
      }
    } catch {
    } finally {
      clearAuthTokens();
      setIsLoggingOut(false);
      window.location.href = '/login';
    }
  };

  const items = section ? TEACHER_NAV_SECTIONS[section].items : [];

  return (
    <aside
      className={`teacher-subnav${isOpen && section ? ' teacher-subnav--open' : ''}`}
      aria-label="Навигация раздела"
      aria-hidden={!isOpen || !section}
    >
      <div className="teacher-subnav__inner">
        <nav className="teacher-subnav__nav">
          {items.map((item, index) => (
            <Link
              key={item.id}
              to={item.path}
              activeOptions={{ exact: true }}
              className={`teacher-subnav__item${isTeacherSubnavItemActive(location.pathname, item) ? ' active' : ''}`}
              style={{ transitionDelay: isOpen ? `${40 + index * 35}ms` : '0ms' }}
            >
              <img className="teacher-subnav__icon" src={item.icon} alt="" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="teacher-subnav__user">
          <img className="teacher-subnav__avatar" src={resolvedAvatarSrc} alt="" />
          <div className="teacher-subnav__user-info">
            <span>{displayName}</span>
            <span>{displayEmail}</span>
          </div>
          <button
            type="button"
            className="teacher-subnav__logout"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            aria-label="Выйти"
          >
            <img src="/teacher/sidebar/sub_nav_courses/log-out.svg" alt="" />
          </button>
        </div>
      </div>
    </aside>
  );
}
