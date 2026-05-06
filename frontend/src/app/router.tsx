import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
//import HomePage from '../pages/HomePage'
//import LoginPage from '../pages/LoginPage'
//import RegistrationPage from '../pages/RegistrationPage'
//import SelectRolePage from '../pages/SelectRolePage'
//import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import { CurricularPage } from '../pages/curricular/curricular-page'
import { ExtracurricularPage } from '../pages/extracurricular_page/extracurricular-page'
import { ProfilePage } from '../pages/profile_page/profile-page'


// корневой роут
const rootRoute = createRootRoute({
    component: () => <Outlet />,
})

// стартовая страница
const ProfileRootRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: ProfilePage,
})

// const HomeRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/home',
//     component: HomePage,
// })

const ProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: ProfilePage,
})

const ExtracurricularRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/extracurricular',
    component: ExtracurricularPage,
})

const CurricularRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/curricular',
    component: CurricularPage,
})

// const RegistrationRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/registration',
//     component: RegistrationPage,
// })

// const LoginRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/login',
//     component: LoginPage,
// })

// const SelectRoleRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/select-role',
//     component: SelectRolePage,
// })

// const ForgotPasswordRoute = createRoute({
//     getParentRoute: () => rootRoute,
//     path: '/forgot-password',
//     component: ForgotPasswordPage,
// })

const routeTree = rootRoute.addChildren([
    ProfileRootRoute,
    ProfileRoute,
    ExtracurricularRoute,
    CurricularRoute,
    // HomeRoute,
    // RegistrationRoute,
    // LoginRoute,
    // SelectRoleRoute,
    // ForgotPasswordRoute,
])

export const router = createRouter({
    routeTree,
})
