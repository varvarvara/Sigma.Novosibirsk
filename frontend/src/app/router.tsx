import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { WelcomePage } from '../pages/welcome_page/welcome-page';
import { SelectRolePage } from '../pages/select_role_page/select-role-page';
import { SetupStudentPage } from '../pages/setup_student_page/setup-student-page';

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
import { AttendancePage } from '../pages/attendance_page/attendance'
import { AchievementPage } from '../pages/achievement_page/achievement'
import { OrgExtracurricularPage } from '../pages/organizators/org_extracurricular_creation/org-exrtacurricular-creation-page'
import { OrgExtracurricularManagementPage } from '../pages/organizators/org_extracurricular/org-extracurricular'
import { TeamCreationPage } from '../pages/organizators/team_creation/team-creation-page'
import { TeamFormationPage } from '../pages/organizators/team_formation/team-formation-page'
import { ExtracurricularPointsAddPage } from '../pages/organizators/extracurricular_points_add/extracurricular-points-add'
import { OrgProfileNewPage } from '../pages/organizators/org_profile_page/org-profile-new'

import { SetupTeacherNewPage } from '../pages/setup_teacher_page/setup-teacher-new';
import { SetupTeacherSuccessPage } from '../pages/setup_teacher_page/setup-teacher-success';
import { TeacherProfileNewPage } from '../pages/teacher_profile_page/teacher-profile-new';
import { TeacherSettingsPage } from '../pages/teacher_settings_page/teacher-settings';
import { TeacherCoursesPage } from '../pages/teacher_courses_page/teacher-courses-page';
import { TeacherCoursesApplyPage } from '../pages/teacher_courses_page/teacher-courses-apply';
import { TeacherCoursesCertificatesPage } from '../pages/teacher_courses_page/teacher-courses-certificates';
import { TeacherCourseEditPage } from '../pages/teacher_course_edit_page/teacher-course-edit-page';
import { TeacherSchedulePage } from '../pages/teacher_schedule_page/teacher-schedule-page';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})


const SelectRoleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/select-role',
    component: SelectRolePage,
})

const SetupStudentRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/setup-student',
    component: SetupStudentPage,
})

const EnterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: EnterPage,
})

const WelcomeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/welcome',
    component: WelcomePage,
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

const AttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/attendance',
  component: AttendancePage,
})

const OrgExtracurricularCreationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-extracurricular-creation',
  component: OrgExtracurricularPage,
})

const OrgExtracurricularManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-extracurricular',
  component: OrgExtracurricularManagementPage,
})

const TeamCreationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team-creation',
  component: TeamCreationPage,
})

const TeamFormationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team-formation',
  component: TeamFormationPage,
})

const ExtracurricularPointsAddRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/extracurricular-points-add',
  validateSearch: (search: Record<string, unknown>) => ({
    title: String(search.title ?? 'Название'),
    date: String(search.date ?? '24 октября'),
    time: String(search.time ?? '15:00'),
    organizer: String(search.organizer ?? 'Иванова Анна'),
  }),
  component: ExtracurricularPointsAddPage,
})

const OrgProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-profile',
  component: OrgProfileNewPage,
})

const SetupTeacherRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/setup-teacher',
    component: SetupTeacherNewPage,
})

const SetupTeacherSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/setup-teacher/success',
    component: SetupTeacherSuccessPage,
})

const TeacherProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/profile',
    component: TeacherProfileNewPage,
})

const TeacherSettingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/settings',
    component: TeacherSettingsPage,
})

const TeacherCoursesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/courses',
    component: TeacherCoursesPage,
})

const TeacherCoursesApplyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/courses/apply',
    component: TeacherCoursesApplyPage,
})

const TeacherCoursesCertificatesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/courses/certificates',
    component: TeacherCoursesCertificatesPage,
})

const TeacherAttendanceRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/attendance',
    component: AttendancePage,
})

const TeacherAchievementRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/achievements',
    component: AchievementPage,
})

const TeacherCourseEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/courses/$courseId/edit',
    component: TeacherCourseEditPage,
})

const TeacherScheduleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/teacher/schedule',
    component: TeacherSchedulePage,
})


const routeTree = rootRoute.addChildren([
  WelcomeRoute,
  SelectRoleRoute,
  SetupStudentRoute,
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
  AttendanceRoute,
  OrgExtracurricularManagementRoute,
  OrgExtracurricularCreationRoute,
  TeamCreationRoute,
  TeamFormationRoute,
  ExtracurricularPointsAddRoute,
  OrgProfileRoute,
  SetupTeacherRoute,
  SetupTeacherSuccessRoute,
  TeacherProfileRoute,
  TeacherSettingsRoute,
  TeacherCoursesRoute,
  TeacherCoursesApplyRoute,
  TeacherCoursesCertificatesRoute,
  TeacherAttendanceRoute,
  TeacherAchievementRoute,
  TeacherCourseEditRoute,
  TeacherScheduleRoute,
])

export const router = createRouter({
  routeTree,
})
