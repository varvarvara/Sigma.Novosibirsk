import { useSyncExternalStore } from 'react'
import { AUTH_MOBILE_MAX_WIDTH_PX, isMobileAuthViewport } from './auth-flow'

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(`(max-width: ${AUTH_MOBILE_MAX_WIDTH_PX}px)`)

  const handleChange = () => {
    onStoreChange()
  }

  mediaQuery.addEventListener('change', handleChange)
  window.addEventListener('resize', handleChange)

  return () => {
    mediaQuery.removeEventListener('change', handleChange)
    window.removeEventListener('resize', handleChange)
  }
}

export function useMobileAuthViewport() {
  return useSyncExternalStore(subscribe, isMobileAuthViewport, () => false)
}
