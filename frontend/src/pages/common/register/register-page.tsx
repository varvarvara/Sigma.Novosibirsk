import { Suspense, lazy } from 'react'
import { loadRegisterPageContent } from '../../../app/lazy-page-loaders'

const RegisterPageContent = lazy(loadRegisterPageContent)
const fallbackStyle = { minHeight: '100vh', padding: '32px 20px', boxSizing: 'border-box' } as const

export function RegisterPage() {
  return (
    <Suspense fallback={<main style={fallbackStyle}>Загрузка регистрации...</main>}>
      <RegisterPageContent />
    </Suspense>
  )
}
