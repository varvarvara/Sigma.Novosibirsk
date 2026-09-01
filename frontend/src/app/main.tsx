import React from 'react'
import ReactDom from 'react-dom/client'
import Providers from './providers.tsx'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router.tsx'
import { AppErrorBoundary } from './error-boundary'
import './styles/globals.css'

const staleChunkReloadKey = 'sigma:stale-chunk-reloaded'
const staleChunkPattern = /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk \d+ failed|dynamically imported module/i

function reloadAfterStaleChunk(reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason)

  if (!staleChunkPattern.test(message) || sessionStorage.getItem(staleChunkReloadKey) === '1') {
    return
  }

  sessionStorage.setItem(staleChunkReloadKey, '1')
  window.location.reload()
}

window.addEventListener('unhandledrejection', (event) => {
  reloadAfterStaleChunk(event.reason)
})

window.addEventListener('error', (event) => {
  reloadAfterStaleChunk(event.error ?? event.message)
})

ReactDom.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </AppErrorBoundary>
  </React.StrictMode>
)
