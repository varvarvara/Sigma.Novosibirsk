import { useCanGoBack, useRouter, type NavigateOptions } from '@tanstack/react-router'
import { ChevronLeft } from '@untitledui/icons/ChevronLeft'

type AuthBackButtonProps = {
  fallback: NavigateOptions
  className?: string
  iconClassName?: string
}

export function useAuthFlowBack(fallback: NavigateOptions) {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  return () => {
    if (canGoBack) {
      router.history.back()
      return
    }

    router.navigate(fallback)
  }
}

export function AuthBackButton({
  fallback,
  className = 'app-back-button',
  iconClassName = 'app-back-button__icon',
}: AuthBackButtonProps) {
  const handleBack = useAuthFlowBack(fallback)

  return (
    <button type="button" className={className} aria-label="Назад" onClick={handleBack}>
      <ChevronLeft className={iconClassName} size={24} color="#2A2730" />
    </button>
  )
}
