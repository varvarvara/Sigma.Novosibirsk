import type { FetchQueryOptions, QueryKey } from '@tanstack/react-query';
import { queryClient } from './query-client';
import {
  loadCourseCardContent,
  loadCourseChoiceContent,
  loadCourseDetailContent,
  loadCourseNothingContent,
  loadCourseSelectionContent,
  loadCoursesEntryContent,
  loadCurricularAchievementsContent,
  loadCurricularContent,
  loadCurricularFilterContent,
  loadExtracurricularContent,
  loadFeedbackContent,
  loadMyCoursesContent,
  loadProfileContent,
  loadProfileSettingsContent,
  loadScheduleContent,
  loadSoonUpdateContent,
  loadOrgExtracurricularContent,
  loadOrgProfileContent,
  loadTeacherAchievementsContent,
  loadTeacherAttendanceContent,
  loadTeacherCourseEditContent,
  loadTeacherCoursesApplyContent,
  loadTeacherCoursesCertificatesContent,
  loadTeacherCoursesContent,
  loadTeacherProfileContent,
  loadTeacherScheduleContent,
} from './lazy-page-loaders';
import {
  enrollmentSlotOptionsQueryOptions,
  myAchievementsQueryOptions,
  myAttendanceChargesQueryOptions,
  myAttendanceDashboardQueryOptions,
  myAttendanceFilterOptionsQueryOptions,
  myEnrollmentsQueryOptions,
  myScheduleEventsQueryOptions,
  schedulePublishStatusQueryOptions,
} from '../entities/student/queries/learning.query-options';
import { getMyExtracurricular } from '../entities/student/api/extracurricular.api';
import { getCurrentStudent, getStudentGamification, getStudentTeam } from '../entities/student/api/profile.api';
import { isStaffProfile } from '../entities/student/model/profile.types';
import { extracurricularQueryKeys } from '../entities/student/queries/extracurricular.queries';
import { studentQueryKeys } from '../entities/student/queries/profile.queries';
import { DEFAULT_SEASON_ID } from '../features/auth/student-registration';
import { scheduleReadyForStudentQueryOptions } from '../features/course-flow/course-flow-query-options';
import { resolveCourseFlowStage } from '../features/course-flow/resolve-course-flow';
import { getCourseAchievementMatrix, getCourseAttendanceSummary } from '../entities/teacher/api/attendance.api';
import { getMyTeacherCourses } from '../entities/teacher/api/courses.api';
import { getTeacherTimetable } from '../entities/teacher/api/schedule.api';
import { teacherAttendanceQueryKeys } from '../entities/teacher/queries/attendance.queries';
import { teacherQueryKey } from '../entities/teacher/queries/courses.queries';
import { teacherScheduleQueryKeys } from '../entities/teacher/queries/schedule.queries';
import {
  listExtracurricularActivities,
  listExtracurricularScores,
} from '../entities/organizer/api/extracurricular.api';
import { getSeasonStaff } from '../entities/organizer/api/season.api';
import { organizerExtracurricularQueryKeys } from '../entities/organizer/queries/extracurricular.queries';
import { seasonQueryKeys } from '../entities/organizer/queries/season.queries';

async function warmChunk(load: () => Promise<unknown>) {
  try {
    await load();
  } catch {
  }
}

async function warmQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  try {
    return await queryClient.ensureQueryData(options);
  } catch {
    return undefined;
  }
}

function warmCurrentUser() {
  return warmQuery({
    queryKey: studentQueryKeys.currentStudent,
    queryFn: getCurrentStudent,
  });
}

function warmTeacherCourses() {
  return warmQuery({
    queryKey: teacherQueryKey,
    queryFn: getMyTeacherCourses,
  });
}

const EXTRACURRICULAR_SEASON_ID = 1;

async function warmStudentProfileRoute() {
  const [currentUser] = await Promise.all([
    warmChunk(loadProfileContent),
    warmCurrentUser(),
  ]);

  if (!currentUser || isStaffProfile(currentUser)) {
    return;
  }

  await Promise.all([
    warmQuery({
      queryKey: studentQueryKeys.studentGamification(currentUser.id),
      queryFn: () => getStudentGamification(currentUser.id),
    }),
    warmQuery({
      queryKey: studentQueryKeys.studentTeam(currentUser.id),
      queryFn: () => getStudentTeam(currentUser.id),
    }),
  ]);
}

async function warmStudentProfileSettingsRoute() {
  await Promise.all([
    warmChunk(loadProfileSettingsContent),
    warmCurrentUser(),
  ]);
}

async function warmStudentExtracurricularRoute() {
  await Promise.all([
    warmChunk(loadExtracurricularContent),
    warmQuery({
      queryKey: extracurricularQueryKeys.myExtracurricular(EXTRACURRICULAR_SEASON_ID),
      queryFn: () => getMyExtracurricular(EXTRACURRICULAR_SEASON_ID),
    }),
  ]);
}

async function warmStudentCurricularRoute() {
  const [currentUser] = await Promise.all([
    warmChunk(loadCurricularContent),
    warmCurrentUser(),
    warmQuery(myAttendanceDashboardQueryOptions()),
    warmQuery(myEnrollmentsQueryOptions()),
    warmQuery(myAttendanceFilterOptionsQueryOptions()),
    warmQuery(myAttendanceChargesQueryOptions()),
    warmQuery(myAchievementsQueryOptions()),
  ]);

  if (!currentUser || isStaffProfile(currentUser)) {
    return;
  }

  await warmQuery({
    queryKey: studentQueryKeys.studentGamification(currentUser.id),
    queryFn: () => getStudentGamification(currentUser.id),
  });
}

async function warmStudentCurricularAchievementsRoute() {
  await Promise.all([
    warmChunk(loadCurricularAchievementsContent),
    warmQuery(myAchievementsQueryOptions()),
  ]);
}

async function warmStudentCurricularFilterRoute() {
  await Promise.all([
    warmChunk(loadCurricularFilterContent),
    warmQuery(myAttendanceFilterOptionsQueryOptions()),
  ]);
}

async function warmStudentCourseSelectionRoute() {
  await Promise.all([
    warmChunk(loadCourseSelectionContent),
    warmQuery(enrollmentSlotOptionsQueryOptions()),
    warmQuery(myEnrollmentsQueryOptions()),
  ]);
}

async function warmStudentCourseDetailRoute() {
  await Promise.all([
    warmChunk(loadCourseDetailContent),
    warmQuery(enrollmentSlotOptionsQueryOptions()),
  ]);
}

async function warmStudentCourseCardRoute() {
  await Promise.all([
    warmChunk(loadCourseCardContent),
    warmQuery(enrollmentSlotOptionsQueryOptions()),
  ]);
}

async function warmStudentCourseChoiceRoute() {
  await warmChunk(loadCourseChoiceContent);
}

async function warmStudentCourseNothingRoute() {
  await warmChunk(loadCourseNothingContent);
}

async function warmStudentSoonUpdateRoute() {
  await warmChunk(loadSoonUpdateContent);
}

async function warmStudentMyCoursesRoute() {
  await Promise.all([
    warmChunk(loadMyCoursesContent),
    warmQuery(myEnrollmentsQueryOptions()),
  ]);
}

async function warmStudentFeedbackRoute() {
  await warmChunk(loadFeedbackContent);
}

async function warmResolvedCourseFlowRoute() {
  try {
    const stage = await resolveCourseFlowStage();

    switch (stage) {
      case 'empty':
        await warmStudentCourseNothingRoute();
        break;
      case 'choose_prompt':
        await warmStudentCourseChoiceRoute();
        break;
      case 'selecting':
        await warmStudentCourseSelectionRoute();
        break;
      case 'waiting_schedule':
        await warmStudentSoonUpdateRoute();
        break;
      case 'active':
        await warmStudentMyCoursesRoute();
        break;
    }
  } catch {
  }
}

async function warmStudentCoursesEntryRoute() {
  await Promise.all([
    warmChunk(loadCoursesEntryContent),
    warmQuery(enrollmentSlotOptionsQueryOptions()),
    warmQuery(myEnrollmentsQueryOptions()),
    warmQuery(schedulePublishStatusQueryOptions(DEFAULT_SEASON_ID)),
    warmQuery(myScheduleEventsQueryOptions(DEFAULT_SEASON_ID)),
  ]);

  await warmResolvedCourseFlowRoute();
}

async function warmStudentScheduleRoute() {
  await Promise.all([
    warmChunk(loadScheduleContent),
    warmQuery(scheduleReadyForStudentQueryOptions()),
    warmQuery(myScheduleEventsQueryOptions(DEFAULT_SEASON_ID)),
  ]);
}

async function warmTeacherProfileRoute() {
  await Promise.all([
    warmChunk(loadTeacherProfileContent),
    warmCurrentUser(),
  ]);
}

async function warmTeacherCoursesRoute() {
  await Promise.all([
    warmChunk(loadTeacherCoursesContent),
    warmTeacherCourses(),
  ]);
}

async function warmTeacherCoursesApplyRoute() {
  await warmChunk(loadTeacherCoursesApplyContent);
}

async function warmTeacherCoursesCertificatesRoute() {
  await warmChunk(loadTeacherCoursesCertificatesContent);
}

async function warmTeacherCourseEditRoute() {
  await warmChunk(loadTeacherCourseEditContent);
}

async function warmTeacherAttendanceRoute() {
  const [courses] = await Promise.all([
    warmTeacherCourses(),
    warmChunk(loadTeacherAttendanceContent),
  ]);

  const firstCourseId = courses?.[0]?.id;
  if (typeof firstCourseId !== 'number') {
    return;
  }

  await warmQuery({
    queryKey: teacherAttendanceQueryKeys.courseSummary(firstCourseId),
    queryFn: () => getCourseAttendanceSummary(firstCourseId),
  });
}

async function warmTeacherAchievementsRoute() {
  const [courses] = await Promise.all([
    warmTeacherCourses(),
    warmChunk(loadTeacherAchievementsContent),
  ]);

  const firstCourseId = courses?.[0]?.id;
  if (typeof firstCourseId !== 'number') {
    return;
  }

  await warmQuery({
    queryKey: teacherAttendanceQueryKeys.achievementMatrix(firstCourseId),
    queryFn: () => getCourseAchievementMatrix(firstCourseId),
  });
}

async function warmTeacherScheduleRoute() {
  const [currentUser] = await Promise.all([
    warmCurrentUser(),
    warmChunk(loadTeacherScheduleContent),
  ]);

  if (!currentUser || !isStaffProfile(currentUser)) {
    return;
  }

  await warmQuery({
    queryKey: teacherScheduleQueryKeys.timetable(currentUser.id),
    queryFn: () => getTeacherTimetable(currentUser.id),
  });
}

async function warmOrganizerProfileRoute() {
  await Promise.all([
    warmChunk(loadOrgProfileContent),
    warmCurrentUser(),
  ]);
}

async function warmOrganizerExtracurricularRoute() {
  await Promise.all([
    warmChunk(loadOrgExtracurricularContent),
    warmQuery({
      queryKey: organizerExtracurricularQueryKeys.activities,
      queryFn: listExtracurricularActivities,
    }),
    warmQuery({
      queryKey: organizerExtracurricularQueryKeys.scores,
      queryFn: listExtracurricularScores,
    }),
    warmQuery({
      queryKey: seasonQueryKeys.staff(DEFAULT_SEASON_ID),
      queryFn: () => getSeasonStaff(DEFAULT_SEASON_ID),
    }),
  ]);
}

const routeWarmers = {
  '/profile': warmStudentProfileRoute,
  '/profile-settings': warmStudentProfileSettingsRoute,
  '/extracurricular': warmStudentExtracurricularRoute,
  '/curricular': warmStudentCurricularRoute,
  '/curricular-achievements': warmStudentCurricularAchievementsRoute,
  '/curricular-filter': warmStudentCurricularFilterRoute,
  '/courses-entry': warmStudentCoursesEntryRoute,
  '/courses': warmStudentCourseSelectionRoute,
  '/course-detail': warmStudentCourseDetailRoute,
  '/course-card': warmStudentCourseCardRoute,
  '/course-choice': warmStudentCourseChoiceRoute,
  '/course-nothing': warmStudentCourseNothingRoute,
  '/soon-update': warmStudentSoonUpdateRoute,
  '/my-courses': warmStudentMyCoursesRoute,
  '/feedback': warmStudentFeedbackRoute,
  '/schedule': warmStudentScheduleRoute,
  '/teacher/profile': warmTeacherProfileRoute,
  '/teacher/courses': warmTeacherCoursesRoute,
  '/teacher/courses/apply': warmTeacherCoursesApplyRoute,
  '/teacher/courses/certificates': warmTeacherCoursesCertificatesRoute,
  '/teacher/course-edit': warmTeacherCourseEditRoute,
  '/teacher/attendance': warmTeacherAttendanceRoute,
  '/teacher/achievements': warmTeacherAchievementsRoute,
  '/teacher/schedule': warmTeacherScheduleRoute,
  '/org-profile': warmOrganizerProfileRoute,
  '/org-extracurricular': warmOrganizerExtracurricularRoute,
} as const;

export function warmRoute(path: string) {
  const warmer = routeWarmers[path as keyof typeof routeWarmers];

  if (!warmer) {
    return;
  }

  void warmer();
}

export function warmTeacherCoursesSection() {
  warmRoute('/teacher/courses');
  warmRoute('/teacher/courses/apply');
  warmRoute('/teacher/courses/certificates');
  warmRoute('/teacher/course-edit');
}

export function warmTeacherAttendanceSection() {
  warmRoute('/teacher/attendance');
  warmRoute('/teacher/achievements');
}
