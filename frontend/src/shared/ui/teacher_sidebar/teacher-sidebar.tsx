import { useLocation } from '@tanstack/react-router';
import './teacher-sidebar-styles.css';

export const TeacherSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <aside className="teacher-sidebar">
      <img
        className="teacher-sidebar-logo"
        src="/teacher/sidebar/logomark.png"
        alt="Sigma"
      />

      <nav className="teacher-sidebar-nav">
        <a
          href="/teacher/profile"
          className={`nav-item ${isActive('/teacher/profile') ? 'active' : ''}`}
          title="Профиль"
        >
          <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="#FFFFFF" strokeWidth="2"/>
            <path d="M12 14C7.58172 14 4 16.6863 4 20V21C4 21.5304 4.21071 22.0391 4.58579 22.4142C4.96086 22.7893 5.46957 23 6 23H18C18.5304 23 19.0391 22.7893 19.4142 22.4142C19.7893 22.0391 20 21.5304 20 21V20C20 16.6863 16.4183 14 12 14Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        <a
          href="/teacher/courses"
          className={`nav-item ${isActive('/teacher/courses') ? 'active' : ''}`}
          title="Курсы"
        >
          <img className="nav-icon" src="/teacher/sidebar/book-open.svg" alt="Курсы" />
        </a>

        <a
          href="/teacher/attendance"
          className={`nav-item ${isActive('/teacher/attendance') ? 'active' : ''}`}
          title="Посещаемость"
        >
          <img className="nav-icon" src="/teacher/sidebar/check-square.svg" alt="Посещаемость" />
        </a>

        <a
          href="/teacher/schedule"
          className={`nav-item ${isActive('/teacher/schedule') ? 'active' : ''}`}
          title="Расписание"
        >
          <img className="nav-icon" src="/teacher/sidebar/calendar.svg" alt="Расписание" />
        </a>
      </nav>

      <div className="teacher-sidebar-divider"></div>

      <div className="teacher-sidebar-bottom">
        <a
          href="/teacher/settings"
          className={`nav-item settings ${isActive('/teacher/settings') ? 'active' : ''}`}
          title="Настройки"
        >
          <img className="nav-icon" src="/teacher/sidebar/settings.svg" alt="Настройки" />
        </a>

        <div className="nav-item avatar">
          <img
            src="/teacher/sidebar/avatar.png"
            alt="Профиль"
          />
        </div>
      </div>
    </aside>
  );
};
