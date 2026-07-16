export type TeacherCourse = {
  id: number;
  title: string;
  description: string | null;
  syllabus_url: string | null;
  cover_image_url: string | null;
  course_status: 'Draft' | 'Archived' | 'Published';
  course_duration: 'ThreeDays' | 'SixDays';
  course_type: 'Olympiad' | 'Author';
  staff_id: number;
  teacher_name: string | null;
  capacity: number | null;
  average_rating: number | null;
  feedback_count: number;
};