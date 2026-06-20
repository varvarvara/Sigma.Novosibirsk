const WEEK_DAYS_COUNT = 7;

function pad(value: number) {
    return value.toString().padStart(2, "0");
}

export function toISODateString(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromISODateString(iso: string) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

export function addDaysToISODate(iso: string, days: number) {
    return toISODateString(addDays(fromISODateString(iso), days));
}

export function getWeekDays(date: Date) {
    const base = new Date(date);
    base.setHours(0, 0, 0, 0);
    const day = base.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = addDays(base, mondayOffset);
    return Array.from({ length: WEEK_DAYS_COUNT }, (_, index) => addDays(monday, index));
}

export function getDayLabel(date: Date) {
    const label = date.toLocaleDateString("ru-RU", { weekday: "short" });
    return label.replace(".", "").slice(0, 2);
}

function normalizeMonthLabel(month: string) {
    return month.slice(0, 1).toUpperCase() + month.slice(1);
}

export function getWeekMonthLabel(weekDays: Date[]) {
    if (weekDays.length === 0) {
        return "";
    }

    const first = weekDays[0];
    const last = weekDays[weekDays.length - 1];
    const firstMonth = first.toLocaleDateString("ru-RU", { month: "long" });
    const lastMonth = last.toLocaleDateString("ru-RU", { month: "long" });
    const firstYear = first.getFullYear();
    const lastYear = last.getFullYear();

    if (firstMonth === lastMonth && firstYear === lastYear) {
        return `${normalizeMonthLabel(firstMonth)} ${firstYear}`;
    }

    if (firstYear === lastYear) {
        return `${normalizeMonthLabel(firstMonth)} / ${lastMonth} ${firstYear}`;
    }

    return `${normalizeMonthLabel(firstMonth)} ${firstYear} / ${lastMonth} ${lastYear}`;
}

export function isToday(date: Date) {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}
