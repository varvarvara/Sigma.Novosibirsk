import { AuthApiError, getAccessToken, request } from "../auth";

export type SlotCourseOption = {
  course_id: number;
  title: string;
  description: string | null;
  syllabus_url: string | null;
  course_type: string | null;
  teacher_name: string | null;
  cover_image_url: string | null;
  capacity: number | null;
  enrolled_count: number;
  seats_left: number | null;
};

export type SlotOptionsItem = {
  slot_hour: number;
  courses: SlotCourseOption[];
  preview_cover_url?: string | null;
};

export type EnrollmentSlotOptionsOut = {
  required_slot_hours: number[];
  slots: SlotOptionsItem[];
};

export type EnrollmentSelectionIn = {
  slot_hour: number;
  course_id: number;
};

export type EnrollmentOutput = {
  id: number;
  student_id: number;
  course_id: number;
  enrolled_at: string | null;
  enrollment_status: "Active" | "Dropped" | "Completed";
  course_title: string | null;
  course_description: string | null;
  course_status: string | null;
  course_duration: string | null;
  course_type: string | null;
  teacher_id: number | null;
  teacher_name: string | null;
};

export type EnrollmentSubmitOut = {
  message: string;
  total_selected: number;
  items: EnrollmentOutput[];
};

export type StudentCourseAttendanceOut = {
  course_id: number;
  course_title: string;
  attended_lessons: number;
  total_lessons: number;
  attendance_percent: number;
};

export type StudentAttendanceDashboardOut = {
  student_id: number;
  attendance_points: number;
  total_attended_lessons: number;
  total_lessons: number;
  courses: StudentCourseAttendanceOut[];
};

export type StudentAchievementDetailedOut = {
  id: number;
  student_id: number;
  achievement_id: number;
  awarded_at: string;
  season_id: number;
  course_id: number;
  course_title: string;
  achievement_name: string;
  achievement_description: string;
  achievement_score: number;
};

export type ScheduleEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    schedule_id: number;
    course_id: number;
    course_title: string;
    course_class_id: number;
    class_number: number;
    teacher_id: number;
    teacher_name: string;
    slot_id: number | null;
    lesson_date: string;
    lesson_time: string;
  };
};

export type ScheduleEventsOut = {
  season_id: number;
  schedule_published?: boolean;
  filters: {
    teacher_id: number | null;
    course_id: number | null;
    student_id: number | null;
  };
  events: ScheduleEvent[];
};

export type SchedulePublishStatusOut = {
  season_id: number;
  published: boolean;
};

function authHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

export function getEnrollmentSlotOptions() {
  return request<EnrollmentSlotOptionsOut>("/enrollment/slots/options", {
    headers: authHeaders(),
  });
}

export function submitEnrollmentSlotSelection(selections: EnrollmentSelectionIn[]) {
  return request<EnrollmentSubmitOut>("/enrollment/slots/submit", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ selections }),
  });
}

export function getMyEnrollments() {
  return request<EnrollmentOutput[]>("/enrollment/me", {
    headers: authHeaders(),
  });
}

export function getMyAttendanceDashboard() {
  return request<StudentAttendanceDashboardOut>("/attendance/me", {
    headers: authHeaders(),
  });
}

export type StudentAttendanceFilterCourseOut = {
  course_id: number;
  course_title: string;
  teacher_name: string;
};

export type StudentAttendanceFilterOptionsOut = {
  courses: StudentAttendanceFilterCourseOut[];
  dates: string[];
};

export type StudentAttendanceChargeOut = {
  schedule_id: number;
  course_id: number;
  course_title: string;
  teacher_name: string;
  lesson_date: string;
  points: number;
  attended: boolean;
};

export function getMyAttendanceFilterOptions() {
  return request<StudentAttendanceFilterOptionsOut>("/attendance/me/filter-options", {
    headers: authHeaders(),
  });
}

export function getMyAttendanceCharges() {
  return request<StudentAttendanceChargeOut[]>("/attendance/me/charges", {
    headers: authHeaders(),
  });
}

export function getMyAchievements() {
  return request<StudentAchievementDetailedOut[]>("/attendance/me/achievements", {
    headers: authHeaders(),
  });
}

export function getMyScheduleEvents(seasonId: number) {
  return request<ScheduleEventsOut>(`/scheduling/events?season_id=${seasonId}`, {
    headers: authHeaders(),
  });
}

export async function getSchedulePublishStatus(seasonId: number) {
  try {
    return await request<SchedulePublishStatusOut>(`/scheduling/publish-status?season_id=${seasonId}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 404) {
      return { season_id: seasonId, published: false };
    }

    throw error;
  }
}
