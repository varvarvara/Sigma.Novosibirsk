import { useLocation } from '@tanstack/react-router';

const navItems = [
  {
    id: 'apply',
    label: 'Подать заявку',
    path: '/teacher/courses/apply',
    icon: '/teacher/sidebar/sub_nav_courses/puls.svg',
  },
  {
    id: 'my',
    label: 'Мои курсы',
    path: '/teacher/courses',
    icon: '/teacher/sidebar/sub_nav_courses/mycourser.svg',
  },
  {
    id: 'certificates',
    label: 'Сертификаты',
    path: '/teacher/courses/certificates',
    icon: '/teacher/sidebar/sub_nav_courses/certificate.svg',
  },
];

export const TeacherCoursesSubnav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (id: string, path: string) => {
    if (id === 'my') {
      return currentPath === path;
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <aside className="courses-subnav">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={item.path}
          className={`courses-subnav-item ${isActive(item.id, item.path) ? 'active' : ''}`}
        >
          <img className="courses-subnav-icon" src={item.icon} alt="" />
          <span>{item.label}</span>
        </a>
      ))}

      <div className="courses-subnav-user">
        <div className="courses-subnav-user-info">
          <span>Olivia Ryne</span>
          <span>olivia@untitledui.com</span>
        </div>
        <img
          className="courses-subnav-logout"
          src="/teacher/sidebar/sub_nav_courses/log-out.svg"
          alt="Выход"
        />
      </div>
    </aside>
  );
};
