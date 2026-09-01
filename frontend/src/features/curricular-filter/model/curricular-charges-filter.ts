export const CURRICULAR_CHARGES_FILTER_KEY = "curricular_charges_filter";

export type CurricularChargesFilter = {
    courseIds: number[];
    dates: string[];
};

export function readCurricularChargesFilter(): CurricularChargesFilter | null {
    const raw = localStorage.getItem(CURRICULAR_CHARGES_FILTER_KEY);
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as CurricularChargesFilter;
        if (!Array.isArray(parsed.courseIds) || !Array.isArray(parsed.dates)) {
            return null;
        }

        return {
            courseIds: parsed.courseIds.filter((id) => Number.isFinite(id)),
            dates: parsed.dates.filter((value) => typeof value === "string" && value.length > 0),
        };
    } catch {
        return null;
    }
}

export function writeCurricularChargesFilter(filter: CurricularChargesFilter) {
    localStorage.setItem(CURRICULAR_CHARGES_FILTER_KEY, JSON.stringify(filter));
}

export function clearCurricularChargesFilter() {
    localStorage.removeItem(CURRICULAR_CHARGES_FILTER_KEY);
}

export function formatFilterDateLabel(isoDate: string) {
    const [year, month, day] = isoDate.split("-").map(Number);
    if (!year || !month || !day) {
        return isoDate;
    }

    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}
