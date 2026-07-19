import type { SlotCourseOption, SlotOptionsItem } from "../../../entities/student/model/learning.types";

export function pickLessonCoverUrl(
    slot: SlotOptionsItem,
    selectedCourse?: SlotCourseOption,
) {
    if (selectedCourse?.cover_image_url?.trim()) {
        return selectedCourse.cover_image_url.trim();
    }

    const courseWithCover = slot.courses.find((course) => Boolean(course.cover_image_url?.trim()));
    if (courseWithCover?.cover_image_url) {
        return courseWithCover.cover_image_url.trim();
    }

    if (slot.preview_cover_url?.trim()) {
        return slot.preview_cover_url.trim();
    }

    return null;
}
