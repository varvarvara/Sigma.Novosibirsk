export const TEACHER_AVATAR_STORAGE_KEY = 'teacherProfileAvatarUrl';
export const TEACHER_AVATAR_UPDATED_EVENT = 'teacherProfileAvatarChanged';
export const TEACHER_PROFILE_UPDATED_EVENT = 'teacherProfileUpdated';

export type TeacherProfileSyncDetail = {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  email?: string;
};

export function persistTeacherAvatarUrl(url: string | null) {
  try {
    if (url) {
      localStorage.setItem(TEACHER_AVATAR_STORAGE_KEY, url);
    } else {
      localStorage.removeItem(TEACHER_AVATAR_STORAGE_KEY);
    }
  } catch {
  }
}

export function readPersistedTeacherAvatarUrl(): string | null {
  try {
    return localStorage.getItem(TEACHER_AVATAR_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function dispatchTeacherProfileUpdated(detail: TeacherProfileSyncDetail = {}) {
  if (detail.avatarUrl !== undefined) {
    persistTeacherAvatarUrl(detail.avatarUrl);
    window.dispatchEvent(new CustomEvent<TeacherProfileSyncDetail>(TEACHER_AVATAR_UPDATED_EVENT, { detail }));
  }

  window.dispatchEvent(new CustomEvent<TeacherProfileSyncDetail>(TEACHER_PROFILE_UPDATED_EVENT, { detail }));
}

export const dispatchTeacherProfileSync = dispatchTeacherProfileUpdated;

export function notifyTeacherAvatarUpdated(avatarUrl: string | null) {
  dispatchTeacherProfileUpdated({ avatarUrl });
}

export function getTeacherProfileSyncDetail(event: Event): TeacherProfileSyncDetail | undefined {
  if (!(event instanceof CustomEvent)) {
    return undefined;
  }

  return event.detail as TeacherProfileSyncDetail | undefined;
}
