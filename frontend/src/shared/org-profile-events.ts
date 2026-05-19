export const ORG_AVATAR_STORAGE_KEY = 'orgProfileAvatar';
export const ORG_AVATAR_UPDATED_EVENT = 'org-profile-avatar-updated';
export const ORG_PROFILE_UPDATED_EVENT = 'org-profile-updated';

export const ORG_DEFAULT_AVATAR_SRC = '/default-avatar.svg';
export const ORG_LOGO_SRC = '/org/sigma-logomark.svg';

export type OrgProfileSyncDetail = {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  email?: string;
};

export function persistOrgAvatarUrl(url: string | null) {
  try {
    if (url) {
      localStorage.setItem(ORG_AVATAR_STORAGE_KEY, url);
    } else {
      localStorage.removeItem(ORG_AVATAR_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}

export function readPersistedOrgAvatarUrl(): string | null {
  try {
    return localStorage.getItem(ORG_AVATAR_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function dispatchOrgProfileUpdated(detail: OrgProfileSyncDetail = {}) {
  if (detail.avatarUrl !== undefined) {
    persistOrgAvatarUrl(detail.avatarUrl);
    window.dispatchEvent(new CustomEvent<OrgProfileSyncDetail>(ORG_AVATAR_UPDATED_EVENT, { detail }));
  }

  window.dispatchEvent(new CustomEvent<OrgProfileSyncDetail>(ORG_PROFILE_UPDATED_EVENT, { detail }));
}

export function getOrgProfileSyncDetail(event: Event): OrgProfileSyncDetail | undefined {
  if (!(event instanceof CustomEvent)) {
    return undefined;
  }

  return event.detail as OrgProfileSyncDetail | undefined;
}
