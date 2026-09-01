import { redirect } from "@tanstack/react-router";
import { AuthApiError } from "../../entities/auth";
import {
    COURSE_FLOW_PATH,
    type CourseFlowStage,
    resolveCourseFlowStage,
} from "./resolve-course-flow";

async function resolveStageOrRedirect() {
    try {
        return await resolveCourseFlowStage();
    } catch (error) {
        if (error instanceof AuthApiError && error.status === 401) {
            throw error;
        }

        return "choose_prompt" satisfies CourseFlowStage;
    }
}

async function guardCourseFlow(allowedStages: CourseFlowStage[]) {
    const stage = await resolveStageOrRedirect();

    if (allowedStages.includes(stage)) {
        return;
    }

    throw redirect({ to: COURSE_FLOW_PATH[stage] });
}

export async function guardCoursesEntry() {
    const stage = await resolveStageOrRedirect();
    throw redirect({ to: COURSE_FLOW_PATH[stage] });
}

export function guardCourseNothing() {
    return guardCourseFlow(["empty"]);
}

export function guardCourseChoice() {
    return guardCourseFlow(["choose_prompt"]);
}

export function guardCourseSelection() {
    return guardCourseFlow(["choose_prompt", "selecting"]);
}

export function guardSoonUpdate() {
    return guardCourseFlow(["waiting_schedule"]);
}

export function guardMyCourses() {
    return guardCourseFlow(["active"]);
}
