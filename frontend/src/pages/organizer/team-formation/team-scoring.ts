export type ChargeType = "Капитан" | "Ведущий" | "Участник";

export type MemberScoreEntry = {
    rawPoints: string;
    chargeType: ChargeType;
};

export const CHARGE_TYPES: ChargeType[] = ["Капитан", "Ведущий", "Участник"];

const CHARGE_MULTIPLIERS: Record<ChargeType, number> = {
    Капитан: 1.5,
    Ведущий: 1.2,
    Участник: 1,
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

export function calculateMemberPoints(rawPoints: number, chargeType: ChargeType) {
    if (rawPoints <= 0) {
        return 0;
    }

    return Math.round(rawPoints * CHARGE_MULTIPLIERS[chargeType]);
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

        const rawPoints = parseRawPoints(entry.rawPoints);
        return total + calculateMemberPoints(rawPoints, entry.chargeType);
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
