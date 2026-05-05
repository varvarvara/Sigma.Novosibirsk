// src/main.jsx
import React from 'react'
import ReactDom from 'react-dom/client'
import Providers from './providers.tsx'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router.tsx'
import './styles/globals.css'

ReactDom.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <Providers>
        <RouterProvider router={router}/>
      </Providers>
  </React.StrictMode>
)
