export type MemberScoreEntry = {
    rawPoints: string;
};

export function getMemberScoreKey(teamId: number | "main", memberId: number) {
    return `${teamId}:${memberId}`;
}

export function parseRawPoints(value: string) {
    const parsed = Number(value.trim());

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 0;
    }

    return Math.floor(parsed);
}

export function calculateTeamTotal(
    memberIds: number[],
    scores: Record<string, MemberScoreEntry>,
    teamId: number | "main",
) {
    return memberIds.reduce((total, memberId) => {
        const entry = scores[getMemberScoreKey(teamId, memberId)];
        if (!entry) {
            return total;
        }

        return total + parseRawPoints(entry.rawPoints);
    }, 0);
}

export function formatTeamPointsLabel(total: number) {
    const lastDigit = total % 10;
    const lastTwoDigits = total % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
        return `${total} балл`;
    }

    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
        return `${total} балла`;
    }

    return `${total} баллов`;
}
