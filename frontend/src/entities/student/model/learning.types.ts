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
  icon_image_key: string | null;
  icon_url: string | null;
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
    classroom: string | null;
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