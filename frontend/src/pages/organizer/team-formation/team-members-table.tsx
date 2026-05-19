import { type MemberScoreEntry, getMemberScoreKey } from "./team-scoring";

type TableMember = {
    id: number;
    name: string;
    avatarUrl?: string | null;
};

type TeamMembersTableProps = {
    teamId: number | "main";
    members: TableMember[];
    memberColors: string[];
    activeMemberId: number;
    memberScores: Record<string, MemberScoreEntry>;
    emptyMessage?: string;
    onSelectMember: (memberId: number) => void;
    onRemoveMember: (member: TableMember) => void;
    onScoreChange: (teamId: number | "main", memberId: number, patch: Partial<MemberScoreEntry>) => void;
};

export function TeamMembersTable({
    teamId,
    members,
    memberColors,
    activeMemberId,
    memberScores,
    emptyMessage = "Участники не найдены.",
    onSelectMember,
    onRemoveMember,
    onScoreChange,
}: TeamMembersTableProps) {
    return (
        <div className="team-table" role="table" aria-label="Участники команды">
            <div className="team-table__header" role="row">
                <span>Участник</span>
                <span>Баллы</span>
                <span />
            </div>
            <div className="team-table__body">
                {members.length === 0 ? (
                    <p className="team-table__empty">{emptyMessage}</p>
                ) : null}
                {members.map((member, index) => {
                    const scoreKey = getMemberScoreKey(teamId, member.id);
                    const entry = memberScores[scoreKey] ?? { rawPoints: "" };

                    return (
                        <button
                            className={`team-member-row team-clickable${activeMemberId === member.id ? " team-member-row--active" : ""}`}
                            type="button"
                            key={`${teamId}-${member.id}`}
                            onClick={() => onSelectMember(member.id)}
                        >
                            <span className="team-member-row__person">
                                {member.avatarUrl ? (
                                    <img
                                        className="team-member-row__avatar team-member-row__avatar--image"
                                        src={member.avatarUrl}
                                        alt=""
                                    />
                                ) : (
                                    <span
                                        className="team-member-row__avatar"
                                        style={{ background: memberColors[index % memberColors.length] }}
                                    >
                                        {member.name[0]}
                                    </span>
                                )}
                                <span>{member.name}</span>
                            </span>

                            <span
                                className="team-member-row__score"
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => event.stopPropagation()}
                            >
                                <input
                                    className="team-score-input"
                                    type="number"
                                    min={0}
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={entry.rawPoints}
                                    aria-label={`Баллы для ${member.name}`}
                                    onChange={(event) =>
                                        onScoreChange(teamId, member.id, { rawPoints: event.target.value })
                                    }
                                />
                            </span>

                            <span
                                className="team-member-row__remove"
                                role="button"
                                tabIndex={0}
                                aria-label={`Удалить ${member.name}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onRemoveMember(member);
                                }}
                            >
                                ×
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
