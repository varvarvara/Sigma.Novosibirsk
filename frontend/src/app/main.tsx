import React from 'react'
import ReactDom from 'react-dom/client'
import Providers from './providers.tsx'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router.tsx'
import { AppErrorBoundary } from './error-boundary'
import './styles/globals.css'


ReactDom.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </AppErrorBoundary>
  </React.StrictMode>
)
