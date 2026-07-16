import type { Student, StudentMeUpdate } from "../../entities/student/model/profile.types";

export type StudentProfileDraft = {
    first_name: string;
    last_name: string;
    partonymic: string;
    birth_day: string;
    birth_month: string;
    birth_year: string;
    school: string;
    year_of_study: string;
    city: string;
    phone: string;
    tg_nickname: string;
    parent_name: string;
    parent_phone: string;
};

export function splitBirthDate(birthDate: string | null | undefined) {
    if (!birthDate) {
        return { birth_day: "", birth_month: "", birth_year: "" };
    }

    const [year, month, day] = birthDate.split("-");
    return {
        birth_day: day ?? "",
        birth_month: month ?? "",
        birth_year: year ?? "",
    };
}

export function getStudentDraft(student: Student | null): StudentProfileDraft {
    const birthParts = splitBirthDate(student?.birth_date);

    return {
        first_name: student?.first_name ?? "",
        last_name: student?.last_name ?? "",
        partonymic: student?.partonymic ?? "",
        birth_day: birthParts.birth_day,
        birth_month: birthParts.birth_month,
        birth_year: birthParts.birth_year,
        school: student?.school ?? "",
        year_of_study: student?.year_of_study ? String(student.year_of_study) : "",
        city: student?.city ?? "",
        phone: student?.phone ?? "",
        tg_nickname: student?.tg_nickname ?? "",
        parent_name: student?.parent_name ?? "",
        parent_phone: student?.parent_phone ?? "",
    };
}

export function composeBirthDate(draft: StudentProfileDraft) {
    const { birth_day: day, birth_month: month, birth_year: year } = draft;
    if (!day && !month && !year) {
        return null;
    }

    if (!day || !month || !year) {
        return undefined;
    }

    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function buildStudentUpdatePayload(draft: StudentProfileDraft): StudentMeUpdate {
    const birthDate = composeBirthDate(draft);

    return {
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
        partonymic: draft.partonymic.trim() || null,
        birth_date: birthDate === undefined ? undefined : birthDate,
        year_of_study: draft.year_of_study ? Number(draft.year_of_study) : undefined,
        city: draft.city.trim() || null,
        school: draft.school.trim() || null,
        phone: draft.phone.trim(),
        tg_nickname: draft.tg_nickname.trim() || null,
        parent_name: draft.parent_name.trim(),
        parent_phone: draft.parent_phone.trim(),
    };
}
