import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { CurricularPage } from '../pages/curricular/curricular-page'
import { CurricularAchievementsPage } from '../pages/curricular_achievements/curricular-achievements'
import { ExtracurricularPage } from '../pages/extracurricular_page/extracurricular-page'
import { FilterPage } from '../pages/filter_page/filter-page'
import { ProfilePage } from '../pages/profile_page/profile-page'
import { SoonUpdatePage } from '../pages/courses_errors/soon_update_page/soon_update_page/soon-update'
import { CourseChoicePage } from '../pages/courses_errors/soon_update_page/course_choice_page/course-choice'
import { CourseNothingPage } from '../pages/courses_errors/soon_update_page/course_nothing_page/course-nothing'

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

const CurricularAchievementsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/curricular-achievements',
    component: CurricularAchievementsPage,
})

const CurricularFilterRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/curricular-filter',
    component: FilterPage,
})

const SoonUpdateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/soon-update',
    component: SoonUpdatePage,
})

const CourseChoiceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/course-choice',
    component: CourseChoicePage,
})

const CourseNothingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/course-nothing',
    component: CourseNothingPage,
})

const routeTree = rootRoute.addChildren([
    ProfileRootRoute,
    ProfileRoute,
    ExtracurricularRoute,
    CurricularRoute,
    CurricularAchievementsRoute,
    CurricularFilterRoute,
    SoonUpdateRoute,
    CourseChoiceRoute,
    CourseNothingRoute,
])

export const router = createRouter({
    routeTree,
})
