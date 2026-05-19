import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { getCurrentStudent, isStaffProfile } from '../../../api/students/profile';
import { TEACHER_DEFAULT_AVATAR_SRC } from '../../../features/teacher/teacher-profile';
import {
  getTeacherProfileSyncDetail,
  persistTeacherAvatarUrl,
  TEACHER_AVATAR_UPDATED_EVENT,
  TEACHER_PROFILE_UPDATED_EVENT,
} from '../../teacher-profile-events';
import { getTeacherNavSectionFromPath, TEACHER_NAV_SECTIONS, type TeacherNavSection } from './teacher-nav-config';
import { TeacherSidebar } from './teacher-sidebar';
import { TeacherSubnavPanel } from './teacher-subnav-panel';
import { readTeacherAvatar } from './use-teacher-avatar';
import './teacher-sidebar-styles.css';
import './teacher-app-shell.css';

type TeacherAppShellProps = {
  children: ReactNode;
  avatarSrc?: string | null;
  className?: string;
};

export function TeacherAppShell({ children, avatarSrc, className }: TeacherAppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const routeSection = getTeacherNavSectionFromPath(location.pathname);

  const [expandedSection, setExpandedSection] = useState<TeacherNavSection | null>(routeSection);
  const [isPanelOpen, setIsPanelOpen] = useState(Boolean(routeSection));
  const [shellAvatarSrc, setShellAvatarSrc] = useState<string | undefined>(() =>
    avatarSrc !== undefined && avatarSrc !== null ? avatarSrc : undefined,
  );

  useEffect(() => {
    if (routeSection) {
      setExpandedSection(routeSection);
      setIsPanelOpen(true);
      return;
    }

    setIsPanelOpen(false);
  }, [routeSection]);

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

        const nextAvatar = user.avatar_url ?? TEACHER_DEFAULT_AVATAR_SRC;
        persistTeacherAvatarUrl(user.avatar_url);
        setShellAvatarSrc(nextAvatar);
      } catch {
        if (!cancelled) {
          setShellAvatarSrc(readTeacherAvatar());
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
      const detail = getTeacherProfileSyncDetail(event);
      if (detail?.avatarUrl !== undefined) {
        setShellAvatarSrc(detail.avatarUrl || TEACHER_DEFAULT_AVATAR_SRC);
        return;
      }

      if (avatarSrc === undefined) {
        setShellAvatarSrc(readTeacherAvatar());
      }
    };

    window.addEventListener(TEACHER_AVATAR_UPDATED_EVENT, handleProfileSync);
    window.addEventListener(TEACHER_PROFILE_UPDATED_EVENT, handleProfileSync);

    return () => {
      window.removeEventListener(TEACHER_AVATAR_UPDATED_EVENT, handleProfileSync);
      window.removeEventListener(TEACHER_PROFILE_UPDATED_EVENT, handleProfileSync);
    };
  }, [avatarSrc]);

  const handleSectionToggle = (section: TeacherNavSection) => {
    if (expandedSection === section && isPanelOpen) {
      setIsPanelOpen(false);
      return;
    }

    setExpandedSection(section);
    setIsPanelOpen(true);

    const sectionConfig = TEACHER_NAV_SECTIONS[section];
    const isOnSection = sectionConfig.paths.some(
      (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
    );

    if (!isOnSection) {
      navigate({ to: sectionConfig.defaultPath });
    }
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  const resolvedAvatarSrc = avatarSrc !== undefined ? avatarSrc : shellAvatarSrc;

  const shellClassName = [
    'teacher-app-shell',
    isPanelOpen && expandedSection ? 'teacher-app-shell--panel-open' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClassName}>
      <TeacherSidebar
        avatarSrc={resolvedAvatarSrc}
        expandedSection={expandedSection}
        isPanelOpen={isPanelOpen}
        onSectionToggle={handleSectionToggle}
        onPanelClose={handlePanelClose}
      />
      <TeacherSubnavPanel section={expandedSection} isOpen={isPanelOpen} avatarSrc={resolvedAvatarSrc} />
      <div className="teacher-app-shell__main">{children}</div>
    </div>
  );
}
