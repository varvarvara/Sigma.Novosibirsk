import { Link, useLocation } from '@tanstack/react-router';
import { type MouseEvent } from 'react';
import type { TeacherNavSection } from './teacher-nav-config';
import { useTeacherAvatar } from './use-teacher-avatar';
import './teacher-sidebar-styles.css';

type TeacherSidebarProps = {
  avatarSrc?: string | null;
  expandedSection?: TeacherNavSection | null;
  isPanelOpen?: boolean;
  onSectionToggle?: (section: TeacherNavSection) => void;
  onPanelClose?: () => void;
};

export const TeacherSidebar = ({
  avatarSrc,
  expandedSection = null,
  isPanelOpen = false,
  onSectionToggle,
  onPanelClose,
}: TeacherSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const resolvedAvatarSrc = useTeacherAvatar(avatarSrc);

  const isActive = (path: string) => {
    if (path === '/teacher/attendance') {
      return (
        currentPath === path ||
        currentPath.startsWith(`${path}/`) ||
        currentPath === '/teacher/achievements' ||
        currentPath.startsWith('/teacher/achievements/')
      );
    }

    if (path === '/teacher/courses') {
      return (
        currentPath === path ||
        currentPath.startsWith(`${path}/`) ||
        currentPath === '/teacher/course-edit' ||
        currentPath.startsWith('/teacher/course-edit/')
      );
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const isSectionRailActive = (section: TeacherNavSection) => {
    if (section === 'courses') {
      return isActive('/teacher/courses');
    }

    return isActive('/teacher/attendance');
  };

  const handleSectionClick = (event: MouseEvent, section: TeacherNavSection) => {
    event.preventDefault();
    onSectionToggle?.(section);
  };

  return (
    <aside className="teacher-sidebar">
      <img className="teacher-sidebar-logo" src="/org/sigma-logomark.svg" alt="Sigma" />

      <nav className="teacher-sidebar-nav">
        <Link
          to="/teacher/profile"
          className={`nav-item ${isActive('/teacher/profile') ? 'active' : ''}`}
          title="Профиль"
          onClick={() => onPanelClose?.()}
        >
          <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="#FFFFFF" strokeWidth="2" />
            <path
              d="M12 14C7.58172 14 4 16.6863 4 20V21C4 21.5304 4.21071 22.0391 4.58579 22.4142C4.96086 22.7893 5.46957 23 6 23H18C18.5304 23 19.0391 22.7893 19.4142 22.4142C19.7893 22.0391 20 21.5304 20 21V20C20 16.6863 16.4183 14 12 14Z"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <Link
          to="/teacher/courses"
          className={`nav-item ${isSectionRailActive('courses') ? 'active' : ''}${expandedSection === 'courses' && isPanelOpen ? ' nav-item--panel-open' : ''}`}
          title="Курсы"
          aria-expanded={expandedSection === 'courses' && isPanelOpen}
          onClick={(event) => handleSectionClick(event, 'courses')}
        >
          <img className="nav-icon" src="/teacher/sidebar/book-open.svg" alt="Курсы" />
        </Link>

        <Link
          to="/teacher/attendance"
          className={`nav-item ${isSectionRailActive('attendance') ? 'active' : ''}${expandedSection === 'attendance' && isPanelOpen ? ' nav-item--panel-open' : ''}`}
          title="Посещаемость"
          aria-expanded={expandedSection === 'attendance' && isPanelOpen}
          onClick={(event) => handleSectionClick(event, 'attendance')}
        >
          <img className="nav-icon" src="/teacher/sidebar/check-square.svg" alt="Посещаемость" />
        </Link>

        <Link
          to="/teacher/schedule"
          className={`nav-item ${isActive('/teacher/schedule') ? 'active' : ''}`}
          title="Расписание"
          onClick={() => onPanelClose?.()}
        >
          <img className="nav-icon" src="/teacher/sidebar/calendar.svg" alt="Расписание" />
        </Link>
      </nav>

      <div className="teacher-sidebar-divider" />

      <div className="teacher-sidebar-bottom">
        <Link
          to="/teacher/profile"
          className={`nav-item avatar ${isActive('/teacher/profile') ? 'active' : ''}`}
          title="Профиль"
          onClick={() => onPanelClose?.()}
        >
          <img src={resolvedAvatarSrc} alt="Профиль" />
        </Link>
      </div>
    </aside>
  );
};
