import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { EnterPage } from '../pages/enter_page/enter-page'
import { RolePage } from '../pages/role_page/role-page'
import { LoginPage } from '../pages/login_page/login-page'
import { PasswordResetPage } from '../pages/password_reset_page/password-reset-page'
import { PasswordResetSuccessPage } from '../pages/password_reset_success_page/password-reset-success-page'
import { RegisterPage } from '../pages/register_page/register-page'
import { ProfilePage } from '../pages/profile_page/profile-page'
import { CurricularPage } from '../pages/curricular/curricular-page'
import { CurricularAchievementsPage } from '../pages/curricular_achievements/curricular-achievements'
import { ExtracurricularPage } from '../pages/extracurricular_page/extracurricular-page'
import { FilterPage } from '../pages/filter_page/filter-page'
import { SchedulePage } from '../pages/schedule_page/schedule-page'
import { CourseSelectionPage } from '../pages/course_selection_page/course-selection-page'
import { CourseDetailPage } from '../pages/course_detail_page/course-detail-page'
import { CourseCardPage } from '../pages/course_card_page/course-card-page'
import { SoonUpdatePage } from '../pages/courses_errors/soon_update_page/soon_update_page/soon-update'
import { CourseChoicePage } from '../pages/courses_errors/soon_update_page/course_choice_page/course-choice'
import { CourseNothingPage } from '../pages/courses_errors/soon_update_page/course_nothing_page/course-nothing'
import { FeedbackPage } from '../pages/feedback_page/feedback'
import { MyCoursesPage } from '../pages/my_courses_page/my-courses-page'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const EnterRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: EnterPage,
})

const EnterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/enter',
  component: EnterPage,
})

const RoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/role',
  component: RolePage,
})

const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const PasswordResetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-reset',
  component: PasswordResetPage,
})

const PasswordResetSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-reset/success',
  component: PasswordResetSuccessPage,
})

const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
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

const ScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  component: SchedulePage,
})

const CoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses',
  component: CourseSelectionPage,
})

const CourseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/course-detail',
  validateSearch: (search: Record<string, unknown>) => {
    const parsedSlotId = Number(search.slotId ?? 1)
    const normalizedSlotId = Number.isInteger(parsedSlotId) && parsedSlotId >= 1 && parsedSlotId <= 3
      ? parsedSlotId
      : 1

    return {
      slotId: normalizedSlotId,
    }
  },
  component: CourseDetailPage,
})

const CourseCardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/course-card',
  validateSearch: (search: Record<string, unknown>) => {
    const parsedSlotId = Number(search.slotId ?? 1)
    const normalizedSlotId = Number.isInteger(parsedSlotId) && parsedSlotId >= 1 && parsedSlotId <= 3
      ? parsedSlotId
      : 1

    const parsedCourseId = Number(search.courseId ?? 101)
    const normalizedCourseId = Number.isInteger(parsedCourseId) && parsedCourseId > 0
      ? parsedCourseId
      : 101

    return {
      slotId: normalizedSlotId,
      courseId: normalizedCourseId,
    }
  },
  component: CourseCardPage,
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

const FeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feedback',
  component: FeedbackPage,
})

const MyCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-courses',
  component: MyCoursesPage,
})

const routeTree = rootRoute.addChildren([
  EnterRootRoute,
  EnterRoute,
  RoleRoute,
  LoginRoute,
  PasswordResetRoute,
  PasswordResetSuccessRoute,
  RegisterRoute,
  ProfileRoute,
  ExtracurricularRoute,
  CurricularRoute,
  CurricularAchievementsRoute,
  CurricularFilterRoute,
  ScheduleRoute,
  CoursesRoute,
  CourseDetailRoute,
  CourseCardRoute,
  SoonUpdateRoute,
  CourseChoiceRoute,
  CourseNothingRoute,
  FeedbackRoute,
  MyCoursesRoute,
])

export const router = createRouter({
  routeTree,
})
