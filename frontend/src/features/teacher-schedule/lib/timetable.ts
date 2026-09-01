import type { TeacherTimetableItem } from "../../../entities/teacher/model/schedule.types";
import { addDays, fromDateKey, pad } from "./date";
import { minutesToTime, timeToMinutes } from "./time";

export type ViewMode = "day" | "week" | "month";

export type Slot = {
    id: string;
    weekday: 1 | 2 | 3 | 4 | 5;
    start: string;
    end: string;
    course: string;
    room: string;
    students: number;
};

export const MONTH_NAMES = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
];

export const WEEKDAY_FULL_NAMES = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
];

export const MODE_LABELS: Record<ViewMode, string> = {
    day: "День",
    week: "Неделя",
    month: "Месяц",
};

function startOfWeek(date: Date) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayIndex = (copy.getDay() + 6) % 7;
    copy.setDate(copy.getDate() - dayIndex);
    return copy;
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function endOfWeek(date: Date) {
    return addDays(startOfWeek(date), 6);
}

function formatLessonTime(value: string) {
    return value.length >= 5 ? value.slice(0, 5) : value;
}

export function formatWeek(date: Date) {
    const start = startOfWeek(date);
    const end = addDays(start, 6);
    if (start.getMonth() === end.getMonth()) {
        return `${pad(start.getDate())}-${pad(end.getDate())} ${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${pad(start.getDate())} ${MONTH_NAMES[start.getMonth()]} - ${pad(end.getDate())} ${MONTH_NAMES[end.getMonth()]} ${start.getFullYear()}`;
}

export function formatMonth(date: Date) {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatHeaderLabel(mode: ViewMode, date: Date) {
    if (mode === "day") {
        return `${pad(date.getDate())} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    }
    if (mode === "week") {
        return formatWeek(date);
    }
    return formatMonth(date);
}

export function buildMonthGrid(date: Date) {
    const firstOfMonth = startOfMonth(date);
    const lastOfMonth = endOfMonth(date);
    const gridStart = startOfWeek(firstOfMonth);
    const gridEnd = endOfWeek(lastOfMonth);
    const grid: Date[] = [];

    let current = gridStart;
    while (current <= gridEnd) {
        grid.push(current);
        current = addDays(current, 1);
    }

    return grid;
}

export function buildWeekDays(date: Date) {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function timetableItemToSlot(item: TeacherTimetableItem): Slot {
    const date = fromDateKey(item.lesson_date);
    const weekday = date.getDay();
    const start = formatLessonTime(item.lesson_time);
    const end = minutesToTime(timeToMinutes(start) + 60);
    const classroom = item.classroom ? `каб. ${item.classroom}` : "кабинет не назначен";

    return {
        id: `schedule-${item.schedule_id}`,
        weekday: (weekday >= 1 && weekday <= 5 ? weekday : 1) as Slot["weekday"],
        start,
        end,
        course: item.course_title,
        room: `Занятие ${item.class_number} · ${classroom}`,
        students: 0,
    };
}

export function groupSlotsByDate(items: TeacherTimetableItem[]) {
    const map: Record<string, Slot[]> = {};

    for (const item of items) {
        const key = item.lesson_date;
        if (!map[key]) {
            map[key] = [];
        }
        map[key].push(timetableItemToSlot(item));
    }

    for (const key of Object.keys(map)) {
        map[key].sort((left, right) => left.start.localeCompare(right.start));
    }

    return map;
}

export function getStoredMode() {
    if (typeof window === "undefined") {
        return "week" as ViewMode;
    }
    const value = window.localStorage.getItem("teacher-schedule-view-mode");
    if (value === "day" || value === "week" || value === "month") {
        return value;
    }
    return "week";
}
