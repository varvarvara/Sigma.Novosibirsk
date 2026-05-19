import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from '../layouts/root-layout'
import { getAuthSession } from '../api/auth'
import {
  parseAuthIntent,
  redirectDesktopRoleToSelectRole,
  redirectMobileSelectRoleToRole,
} from '../features/auth/auth-flow'
import {
  guardCourseChoice,
  guardCourseNothing,
  guardCourseSelection,
  guardCoursesEntry,
  guardMyCourses,
  guardSoonUpdate,
} from '../features/course-flow/course-flow-guards'
import { WelcomePage, EnterPage } from '../pages/common/welcome'
import { RolePage } from '../pages/common/role'
import { SelectRolePage } from '../pages/common/select-role'
import { LoginPage } from '../pages/common/login'
import { PasswordResetPage } from '../pages/common/password-reset'
import { PasswordResetSuccessPage } from '../pages/common/password-reset-success'
import { RegisterPage } from '../pages/common/register'
import { SetupStudentPage } from '../pages/common/setup-student'
import { SetupTeacherNewPage, SetupTeacherSuccessPage } from '../pages/common/setup-teacher'
import { ProfilePage } from '../pages/student/profile'
import { ProfileSettingsPage } from '../pages/student/profile-settings'
import { CurricularPage } from '../pages/student/curricular'
import { CurricularAchievementsPage } from '../pages/student/curricular-achievements'
import { ExtracurricularPage } from '../pages/student/extracurricular'
import { FilterPage } from '../pages/student/curricular-filter'
import { SchedulePage } from '../pages/student/schedule'
import { CoursesEntryPage } from '../pages/student/courses-entry'
import { CourseSelectionPage } from '../pages/student/course-selection'
import { CourseDetailPage } from '../pages/student/course-detail'
import { CourseCardPage } from '../pages/student/course-card'
import { SoonUpdatePage } from '../pages/student/soon-update'
import { CourseChoicePage } from '../pages/student/course-choice'
import { CourseNothingPage } from '../pages/student/course-nothing'
import { FeedbackPage } from '../pages/student/feedback'
import { MyCoursesPage } from '../pages/student/my-courses'
import { OrgExtracurricularCreationPage, OrgExtracurricularPage } from '../pages/organizer/org-extracurricular'
import { TeamFormationPage } from '../pages/organizer/team-formation'
import { TeamCreationPage } from '../pages/organizer/team-creation'
import { OrgProfileNewPage } from '../pages/organizer/profile/org-profile-new'
import { ExtracurricularPointsAddPage } from '../pages/organizer/extracurricular-points-add/extracurricular-points-add'
import { OrgCoursesStubPage, OrgScheduleStubPage, OrgUsersStubPage } from '../pages/organizer/org-stub'
import { TeacherProfilePage } from '../pages/teacher/profile'
import { TeacherCoursesPage } from '../pages/teacher/courses'
import { TeacherCoursesApplyPage } from '../pages/teacher/courses/teacher-courses-apply'
import { TeacherCoursesCertificatesPage } from '../pages/teacher/courses/teacher-courses-certificates'
import { TeacherCourseEditPage } from '../pages/teacher/course-edit'
import { TeacherAttendancePage } from '../pages/teacher/attendance'
import { TeacherAchievementsPage } from '../pages/teacher/achievements'
import { TeacherSchedulePage } from '../pages/teacher/schedule'

const rootRoute = createRootRoute({
  component: RootLayout,
})

function authIntentSearch(search: Record<string, unknown>) {
  return { intent: parseAuthIntent(search) }
}

function getRoleHomePath() {
  const session = getAuthSession()
  if (!session) {
    return '/login'
  }
  if (session.userType === 'student') {
    return '/profile'
  }
  if (session.staffRole === 'Admin') {
    return '/org-extracurricular'
  }
  return '/teacher/profile'
}

function redirectIfAuthenticated() {
  const session = getAuthSession()
  if (session) {
    throw redirect({ to: getRoleHomePath() })
  }
}

function requireAuth() {
  const session = getAuthSession()
  if (!session) {
    throw redirect({ to: '/login' })
  }
}

function requireAdmin() {
  const session = getAuthSession()
  if (!session) {
    throw redirect({ to: '/login' })
  }
  if (session.userType !== 'staff' || session.staffRole !== 'Admin') {
    throw redirect({ to: getRoleHomePath() })
  }
}

function requireTeacher() {
  const session = getAuthSession()
  if (!session) {
    throw redirect({ to: '/login' })
  }
  if (session.userType !== 'staff' || session.staffRole !== 'Teacher') {
    throw redirect({ to: getRoleHomePath() })
  }
}

const WelcomeRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: redirectIfAuthenticated,
  component: WelcomePage,
})

const EnterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/enter',
  beforeLoad: redirectIfAuthenticated,
  component: EnterPage,
})

const RoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/role',
  beforeLoad: ({ search }) => {
    redirectIfAuthenticated()
    redirectDesktopRoleToSelectRole(search)
  },
  validateSearch: authIntentSearch,
  component: RolePage,
})

const SelectRoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/select-role',
  beforeLoad: ({ search }) => {
    redirectIfAuthenticated()
    redirectMobileSelectRoleToRole(search)
  },
  validateSearch: authIntentSearch,
  component: SelectRolePage,
})

const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: redirectIfAuthenticated,
  component: LoginPage,
})

const PasswordResetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-reset',
  beforeLoad: redirectIfAuthenticated,
  validateSearch: (search: Record<string, unknown>) => {
    const rawToken = search.token
    const token = typeof rawToken === 'string' && rawToken.trim().length > 0 ? rawToken.trim() : undefined
    return { token }
  },
  component: PasswordResetPage,
})

const PasswordResetSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-reset/success',
  beforeLoad: redirectIfAuthenticated,
  component: PasswordResetSuccessPage,
})

const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: redirectIfAuthenticated,
  component: RegisterPage,
})

const SetupStudentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup-student',
  beforeLoad: redirectIfAuthenticated,
  component: SetupStudentPage,
})

const SetupTeacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup-teacher',
  beforeLoad: redirectIfAuthenticated,
  component: SetupTeacherNewPage,
})

const SetupTeacherSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setup-teacher/success',
  component: SetupTeacherSuccessPage,
})

const ProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: requireAuth,
  component: ProfilePage,
})

const ProfileSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile-settings',
  beforeLoad: requireAuth,
  component: ProfileSettingsPage,
})

const ExtracurricularRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extracurricular',
  beforeLoad: requireAuth,
  component: ExtracurricularPage,
})

const CurricularRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/curricular',
  beforeLoad: requireAuth,
  component: CurricularPage,
})

const CurricularAchievementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/curricular-achievements',
  beforeLoad: requireAuth,
  component: CurricularAchievementsPage,
})

const CurricularFilterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/curricular-filter',
  beforeLoad: requireAuth,
  component: FilterPage,
})

const ScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  beforeLoad: requireAuth,
  component: SchedulePage,
})

const CoursesEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses-entry',
  beforeLoad: async () => {
    requireAuth()
    await guardCoursesEntry()
  },
  component: CoursesEntryPage,
})

const CoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses',
  beforeLoad: async () => {
    requireAuth()
    await guardCourseSelection()
  },
  component: CourseSelectionPage,
})

const CourseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/course-detail',
  beforeLoad: async () => {
    requireAuth()
    await guardCourseSelection()
  },
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
  beforeLoad: async () => {
    requireAuth()
    await guardCourseSelection()
  },
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
  beforeLoad: async () => {
    requireAuth()
    await guardSoonUpdate()
  },
  component: SoonUpdatePage,
})

const CourseChoiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/course-choice',
  beforeLoad: async () => {
    requireAuth()
    await guardCourseChoice()
  },
  component: CourseChoicePage,
})

const CourseNothingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/course-nothing',
  beforeLoad: async () => {
    requireAuth()
    await guardCourseNothing()
  },
  component: CourseNothingPage,
})

const FeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feedback',
  beforeLoad: requireAuth,
  component: FeedbackPage,
})

const MyCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-courses',
  beforeLoad: async () => {
    requireAuth()
    await guardMyCourses()
  },
  component: MyCoursesPage,
})

const OrgExtracurricularRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-extracurricular',
  beforeLoad: requireAdmin,
  component: OrgExtracurricularPage,
})

const OrgExtracurricularCreationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-extracurricular-creation',
  beforeLoad: requireAdmin,
  component: OrgExtracurricularCreationPage,
})

const TeamFormationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team-formation',
  beforeLoad: requireAdmin,
  component: TeamFormationPage,
})

const TeamCreationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team-creation',
  beforeLoad: requireAdmin,
  component: TeamCreationPage,
})

const OrgProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-profile',
  beforeLoad: requireAdmin,
  component: OrgProfileNewPage,
})

const ExtracurricularPointsAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extracurricular-points-add',
  beforeLoad: requireAdmin,
  validateSearch: (search: Record<string, unknown>) => ({
    activityId: typeof search.activityId === 'number' ? search.activityId : Number(search.activityId) || undefined,
    title: typeof search.title === 'string' ? search.title : undefined,
    date: typeof search.date === 'string' ? search.date : undefined,
    time: typeof search.time === 'string' ? search.time : undefined,
    organizer: typeof search.organizer === 'string' ? search.organizer : undefined,
  }),
  component: ExtracurricularPointsAddPage,
})

const OrgUsersStubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-users-stub',
  beforeLoad: requireAdmin,
  component: OrgUsersStubPage,
})

const OrgScheduleStubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-schedule-stub',
  beforeLoad: requireAdmin,
  component: OrgScheduleStubPage,
})

const OrgCoursesStubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-courses-stub',
  beforeLoad: requireAdmin,
  component: OrgCoursesStubPage,
})

const TeacherProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/profile',
  beforeLoad: requireTeacher,
  component: TeacherProfilePage,
})

const TeacherCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/courses',
  beforeLoad: requireTeacher,
  component: TeacherCoursesPage,
})

const TeacherCoursesApplyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/courses/apply',
  beforeLoad: requireTeacher,
  component: TeacherCoursesApplyPage,
})

const TeacherCoursesCertificatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/courses/certificates',
  beforeLoad: requireTeacher,
  component: TeacherCoursesCertificatesPage,
})

const TeacherCourseEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/course-edit',
  beforeLoad: requireTeacher,
  component: TeacherCourseEditPage,
})

const TeacherAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/attendance',
  beforeLoad: requireTeacher,
  component: TeacherAttendancePage,
})

const TeacherAchievementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/achievements',
  beforeLoad: requireTeacher,
  component: TeacherAchievementsPage,
})

const TeacherScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher/schedule',
  beforeLoad: requireTeacher,
  component: TeacherSchedulePage,
})

const routeTree = rootRoute.addChildren([
  WelcomeRootRoute,
  EnterRoute,
  RoleRoute,
  SelectRoleRoute,
  LoginRoute,
  PasswordResetRoute,
  PasswordResetSuccessRoute,
  RegisterRoute,
  SetupStudentRoute,
  SetupTeacherRoute,
  SetupTeacherSuccessRoute,
  ProfileRoute,
  ProfileSettingsRoute,
  ExtracurricularRoute,
  CurricularRoute,
  CurricularAchievementsRoute,
  CurricularFilterRoute,
  ScheduleRoute,
  CoursesEntryRoute,
  CoursesRoute,
  CourseDetailRoute,
  CourseCardRoute,
  SoonUpdateRoute,
  CourseChoiceRoute,
  CourseNothingRoute,
  FeedbackRoute,
  MyCoursesRoute,
  OrgExtracurricularRoute,
  OrgExtracurricularCreationRoute,
  TeamFormationRoute,
  TeamCreationRoute,
  OrgProfileRoute,
  ExtracurricularPointsAddRoute,
  OrgUsersStubRoute,
  OrgScheduleStubRoute,
  OrgCoursesStubRoute,
  TeacherProfileRoute,
  TeacherCoursesRoute,
  TeacherCoursesApplyRoute,
  TeacherCoursesCertificatesRoute,
  TeacherCourseEditRoute,
  TeacherAttendanceRoute,
  TeacherAchievementsRoute,
  TeacherScheduleRoute,
])

export const router = createRouter({
  routeTree,
})
