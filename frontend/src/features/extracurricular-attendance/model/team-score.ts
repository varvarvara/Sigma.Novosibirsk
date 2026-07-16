type TeamScore = {
    id: number;
    name: string;
    points: number;
    visited: boolean;
};

type ExtracurricularTeamLike = {
    id: number;
    ex_team_name: string;
};

type ExtracurricularScoreLike = {
    ex_course_id: number;
    team_id: number;
};

export function buildTeamScores(
    teams: ExtracurricularTeamLike[],
    scores: ExtracurricularScoreLike[],
    activityId: number,
    defaultPoints: number,
): TeamScore[] {
    const scoredTeamIds = new Set(
        scores
            .filter((score) => score.ex_course_id === activityId)
            .map((score) => score.team_id),
    );

    return teams.map((team) => ({
        id: team.id,
        name: team.ex_team_name,
        points: scoredTeamIds.has(team.id) ? defaultPoints : 0,
        visited: scoredTeamIds.has(team.id),
    }));
}

export type { TeamScore };
