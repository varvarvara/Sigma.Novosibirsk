import { useEffect, useState } from 'react';
import {
  getOrgProfileSyncDetail,
  ORG_AVATAR_UPDATED_EVENT,
  ORG_DEFAULT_AVATAR_SRC,
  ORG_PROFILE_UPDATED_EVENT,
  readPersistedOrgAvatarUrl,
} from '../../shared/org-profile-events';

export { ORG_AVATAR_UPDATED_EVENT } from '../../shared/org-profile-events';

export function readOrgAvatar(override?: string | null) {
  if (override !== undefined && override !== null && override !== '') {
    return override;
  }

  const persisted = readPersistedOrgAvatarUrl();
  if (persisted) {
    return persisted;
  }

  return ORG_DEFAULT_AVATAR_SRC;
}

export function useOrgAvatar(override?: string | null) {
  const [avatar, setAvatar] = useState(() => readOrgAvatar(override));

  useEffect(() => {
    setAvatar(readOrgAvatar(override));
  }, [override]);

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = getOrgProfileSyncDetail(event);
      if (detail?.avatarUrl !== undefined) {
        setAvatar(detail.avatarUrl || ORG_DEFAULT_AVATAR_SRC);
        return;
      }

      setAvatar(readOrgAvatar(override));
    };

    window.addEventListener(ORG_AVATAR_UPDATED_EVENT, sync);
    window.addEventListener(ORG_PROFILE_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(ORG_AVATAR_UPDATED_EVENT, sync);
      window.removeEventListener(ORG_PROFILE_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [override]);

  return avatar;
}
