export type TeacherNavSection = 'courses' | 'attendance';

export type TeacherSubnavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
};

export const TEACHER_RAIL_WIDTH_PX = 72;
export const TEACHER_SUBNAV_WIDTH_PX = 260;

const coursesPaths = ['/teacher/courses', '/teacher/courses/apply', '/teacher/courses/certificates', '/teacher/course-edit'];
const attendancePaths = ['/teacher/attendance', '/teacher/achievements'];

export const TEACHER_NAV_SECTIONS: Record<
  TeacherNavSection,
  {
    paths: string[];
    defaultPath: string;
    items: TeacherSubnavItem[];
  }
> = {
  courses: {
    paths: coursesPaths,
    defaultPath: '/teacher/courses',
    items: [
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
    ],
  },
  attendance: {
    paths: attendancePaths,
    defaultPath: '/teacher/attendance',
    items: [
      {
        id: 'attendance',
        label: 'Посещаемость',
        path: '/teacher/attendance',
        icon: '/teacher/sidebar/check-square.svg',
      },
      {
        id: 'achievements',
        label: 'Ачивки',
        path: '/teacher/achievements',
        icon: '/teacher/sidebar/sub_nav_courses/puls.svg',
      },
    ],
  },
};

export function getTeacherNavSectionFromPath(pathname: string): TeacherNavSection | null {
  if (coursesPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return 'courses';
  }

  if (attendancePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return 'attendance';
  }

  return null;
}

export function isTeacherSubnavItemActive(pathname: string, item: TeacherSubnavItem) {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  const normalizedItemPath = item.path.replace(/\/$/, '') || '/';

  return normalizedPath === normalizedItemPath;
}
