export function pad(value: number) {
    return String(value).padStart(2, "0");
}

export function toDateKey(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateKey(key: string) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number) {
    const copy = startOfDay(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
}

export function addMonths(date: Date, amount: number) {
    return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

