import { useEffect, useState } from 'react';
import { TEACHER_DEFAULT_AVATAR_SRC } from '../../features/teacher/teacher-profile';
import {
  getTeacherProfileSyncDetail,
  readPersistedTeacherAvatarUrl,
  TEACHER_AVATAR_UPDATED_EVENT,
  TEACHER_PROFILE_UPDATED_EVENT,
} from '../../shared/teacher-profile-events';

export function readTeacherAvatar(override?: string | null) {
  if (override !== undefined && override !== null && override !== '') {
    return override;
  }

  const persisted = readPersistedTeacherAvatarUrl();
  if (persisted) {
    return persisted;
  }

  return TEACHER_DEFAULT_AVATAR_SRC;
}

export function useTeacherAvatar(override?: string | null) {
  const [avatar, setAvatar] = useState(() => readTeacherAvatar(override));

  useEffect(() => {
    setAvatar(readTeacherAvatar(override));
  }, [override]);

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = getTeacherProfileSyncDetail(event);
      if (detail?.avatarUrl !== undefined) {
        setAvatar(detail.avatarUrl || TEACHER_DEFAULT_AVATAR_SRC);
        return;
      }

      setAvatar(readTeacherAvatar(override));
    };

    window.addEventListener(TEACHER_AVATAR_UPDATED_EVENT, sync);
    window.addEventListener(TEACHER_PROFILE_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(TEACHER_AVATAR_UPDATED_EVENT, sync);
      window.removeEventListener(TEACHER_PROFILE_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [override]);

  return avatar;
}
