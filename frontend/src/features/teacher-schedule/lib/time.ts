import { pad } from "./date";

export function timeToMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
    const safe = ((minutes % 1440) + 1440) % 1440;
    const hours = Math.floor(safe / 60);
    const mins = safe % 60;
    return `${pad(hours)}:${pad(mins)}`;
}

export function getNovosibirskTimeParts(date: Date) {
    const parts = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Asia/Novosibirsk",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

    return { hour, minute };
}
