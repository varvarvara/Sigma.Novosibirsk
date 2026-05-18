import { useEffect, useState } from 'react'

const DEFAULT_AVATAR = '/teacher/profile/avatar-profile.png'
export const ORG_AVATAR_UPDATED_EVENT = 'org-profile-avatar-updated'

export function readOrgAvatar(override?: string | null) {
  if (override !== undefined && override !== null && override !== '') {
    return override
  }

  return localStorage.getItem('orgProfileAvatar') ?? DEFAULT_AVATAR
}

export function useOrgAvatar(override?: string | null) {
  const [avatar, setAvatar] = useState(() => readOrgAvatar(override))

  useEffect(() => {
    setAvatar(readOrgAvatar(override))
  }, [override])

  useEffect(() => {
    const sync = () => setAvatar(readOrgAvatar(override))

    window.addEventListener(ORG_AVATAR_UPDATED_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(ORG_AVATAR_UPDATED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [override])

  return avatar
}
