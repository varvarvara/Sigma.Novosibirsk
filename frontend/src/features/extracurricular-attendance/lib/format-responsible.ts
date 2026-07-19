export function formatResponsible(name: string) {
    const parts = name.trim().split(" ").filter(Boolean);

    return `${parts[1] ?? parts[0]} ${parts[0]?.[0] ?? ""}.`;
}
