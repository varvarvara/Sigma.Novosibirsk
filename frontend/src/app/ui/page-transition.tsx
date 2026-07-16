import { Outlet } from '@tanstack/react-router'

/** Обёртка маршрута без анимации переключения страниц */
export function PageTransition() {
  return (
    <div className="page-transition">
      <Outlet />
    </div>
  )
}
