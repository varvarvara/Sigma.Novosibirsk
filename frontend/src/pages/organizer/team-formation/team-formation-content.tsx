import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { warmRoute } from '../../../app/route-warmers';
import { AuthApiError } from '../../../entities/auth';
import {
  useDeleteTeamMutation,
  useListScoresQuery,
  useListTeamsQuery,
  useRemoveTeamMemberMutation,
  useUpdateTeamMutation,
} from '../../../entities/organizer/queries/extracurricular.queries';
import {
  useSeasonExtracurricularTeamMembersQuery,
  useSeasonStudentsQuery,
} from '../../../entities/organizer/queries/season.queries';
import type { ExtracurricularTeam } from '../../../entities/organizer/model/extracurricular.types';
import type { SeasonStudent, SeasonTeamMember } from '../../../entities/organizer/model/season.types';
import { DEFAULT_SEASON_ID } from '../../../features/auth/student-registration';
import { OrgPanelState } from '../../../shared/ui/org-panel-state';
import { TeamMembersTable } from './team-members-table';
import { formatTeamPointsLabel, getMemberScoreKey, type MemberScoreEntry } from './team-scoring';
import './team-formation-page.css';

type TeamMember = {
  id: number;
  name: string;
  avatarUrl?: string | null;
};

type Team = {
  id: number;
  title: string;
  number: number;
  direction: string;
  captain: string;
  count: string;
  color: string;
  members: TeamMember[];
  totalPoints: number;
};

const memberColors = ['#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#0EA5E9', '#EF4444'];

function formatParticipantsCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} участник`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} участника`;
  }

  return `${count} участников`;
}

function formatStudentName(student: SeasonStudent) {
  return `${student.last_name} ${student.first_name}`.trim();
}

function buildMembersForTeam(
  teamId: number,
  memberships: SeasonTeamMember[],
  studentsById: Map<number, SeasonStudent>,
): TeamMember[] {
  return memberships
    .filter((membership) => membership.team_id === teamId)
    .map((membership) => {
      const student = studentsById.get(membership.student_id);

      return {
        id: membership.student_id,
        name: student ? formatStudentName(student) : `Студент #${membership.student_id}`,
        avatarUrl: student?.avatar_url ?? null,
      };
    });
}

function mapTeam(
  apiTeam: ExtracurricularTeam,
  index: number,
  teamPoints: Map<number, number>,
  members: TeamMember[],
): Team {
  const totalPoints = teamPoints.get(apiTeam.id) ?? 0;

  return {
    id: apiTeam.id,
    title: apiTeam.ex_team_name,
    number: apiTeam.ex_team_number,
    direction: `Команда №${apiTeam.ex_team_number}`,
    captain: '—',
    count: formatParticipantsCount(members.length),
    color: memberColors[index % memberColors.length],
    members,
    totalPoints,
  };
}

export default function TeamFormationContent() {
  const navigate = useNavigate();
  const [teamItems, setTeamItems] = useState<Team[]>([]);
  const [query, setQuery] = useState('');
  const [activeMemberId, setActiveMemberId] = useState(0);
  const [collapsedTeamIds, setCollapsedTeamIds] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const [memberScores, setMemberScores] = useState<Record<string, MemberScoreEntry>>({});
  const {
    data: apiTeams = [],
    isLoading: isTeamsLoading,
    error: teamsError,
  } = useListTeamsQuery();
  const {
    data: scores = [],
    isLoading: isScoresLoading,
    error: scoresError,
  } = useListScoresQuery();
  const {
    data: memberships = [],
    isLoading: isMembershipsLoading,
    error: membershipsError,
  } = useSeasonExtracurricularTeamMembersQuery(DEFAULT_SEASON_ID);
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useSeasonStudentsQuery(DEFAULT_SEASON_ID);
  const updateTeamMutation = useUpdateTeamMutation(DEFAULT_SEASON_ID);
  const deleteTeamMutation = useDeleteTeamMutation(DEFAULT_SEASON_ID);
  const removeTeamMemberMutation = useRemoveTeamMemberMutation(DEFAULT_SEASON_ID);

  const isLoading = isTeamsLoading || isScoresLoading || isMembershipsLoading || isStudentsLoading;
  const error =
    teamsError instanceof AuthApiError ? teamsError.message :
    scoresError instanceof AuthApiError ? scoresError.message :
    membershipsError instanceof AuthApiError ? membershipsError.message :
    studentsError instanceof AuthApiError ? studentsError.message :
    teamsError || scoresError || membershipsError || studentsError ? 'Не удалось загрузить команды' : null;

  const mappedTeams = useMemo(() => {
    const studentsById = new Map(students.map((student) => [student.id, student] as const));
    const teamPoints = scores.reduce<Map<number, number>>((acc, score) => {
      acc.set(score.team_id, (acc.get(score.team_id) ?? 0) + score.score);
      return acc;
    }, new Map());

    return apiTeams.map((team, index) =>
      mapTeam(team, index, teamPoints, buildMembersForTeam(team.id, memberships, studentsById)),
    );
  }, [apiTeams, memberships, scores, students]);

  useEffect(() => {
    setTeamItems(mappedTeams);
    setCollapsedTeamIds(mappedTeams.map((team) => team.id));
    setNotice('');
  }, [mappedTeams]);

  const updateMemberScore = (
    teamId: number,
    memberId: number,
    patch: Partial<MemberScoreEntry>,
  ) => {
    const scoreKey = getMemberScoreKey(teamId, memberId);

    setMemberScores((current) => {
      const previous = current[scoreKey] ?? { rawPoints: '' };

      return {
        ...current,
        [scoreKey]: {
          ...previous,
          ...patch,
        },
      };
    });
  };

  const toggleTeamPanel = (id: number) => {
    setCollapsedTeamIds((ids) => (ids.includes(id) ? ids.filter((teamId) => teamId !== id) : [...ids, id]));
  };

  const updateTeamField = (
    teamId: number,
    patch: Partial<Pick<Team, 'title' | 'number'>>,
  ) => {
    setTeamItems((current) =>
      current.map((team) =>
        team.id === teamId
          ? {
              ...team,
              ...patch,
              direction: `Команда №${patch.number ?? team.number}`,
            }
          : team,
      ),
    );
  };

  const saveTeam = async (team: Team) => {
    try {
      setNotice('');
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        payload: {
          ex_team_name: team.title.trim() || team.title,
          ex_team_number: team.number,
        },
      });
      setNotice(`Команда «${team.title}» сохранена`);
    } catch (saveError) {
      if (saveError instanceof AuthApiError) {
        setNotice(saveError.message);
      } else {
        setNotice('Не удалось сохранить изменения команды');
      }
    }
  };

  const deleteTeam = async (team: Team) => {
    try {
      setNotice('');
      await deleteTeamMutation.mutateAsync(team.id);
      setNotice(`Команда «${team.title}» удалена`);
    } catch (deleteError) {
      if (deleteError instanceof AuthApiError) {
        setNotice(deleteError.message);
      } else {
        setNotice('Не удалось удалить команду');
      }
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const warmExtracurricularRoute = () => warmRoute('/org-extracurricular');
  const warmTeamCreationRoute = () => warmRoute('/team-creation');

  const openExtracurricular = () => {
    warmExtracurricularRoute();
    navigate({ to: '/org-extracurricular' });
  };

  const openTeamCreation = () => {
    warmTeamCreationRoute();
    navigate({ to: '/team-creation' });
  };

  return (
    <section className="org-layout__workspace team-workspace">
      <header className="team-header">
        <div className="team-header__left">
          <h1>Команды</h1>
          <nav className="team-tabs" aria-label="Разделы внеучебки">
            <button
              className="team-tabs__item team-clickable"
              type="button"
              onClick={openExtracurricular}
              onPointerEnter={warmExtracurricularRoute}
              onPointerDown={warmExtracurricularRoute}
              onFocus={warmExtracurricularRoute}
            >
              Мероприятия
            </button>
            <button className="team-tabs__item team-tabs__item--active team-clickable" type="button">
              Команды
            </button>
            <button className="team-tabs__item team-clickable" type="button">
              Рейтинг
            </button>
          </nav>
        </div>
        <button
          className="team-primary-button team-clickable"
          type="button"
          onClick={openTeamCreation}
          onPointerEnter={warmTeamCreationRoute}
          onPointerDown={warmTeamCreationRoute}
          onFocus={warmTeamCreationRoute}
        >
          Создать команду
        </button>
      </header>

      {notice ? <p className="team-formation-notice" role="status">{notice}</p> : null}

      {isLoading ? (
        <OrgPanelState variant="loading" title="Загружаем команды…" />
      ) : error ? (
        <OrgPanelState
          variant="error"
          title="Не удалось загрузить команды"
          message={error}
        />
      ) : teamItems.length === 0 ? (
        <OrgPanelState
          variant="empty"
          title="Команд пока нет"
          message="Создайте команду, чтобы добавить участников и начислять баллы"
        />
      ) : (
        <section className="team-list" aria-label="Команды">
          {teamItems.map((team) => {
            const collapsed = collapsedTeamIds.includes(team.id);
            const teamMembers = team.members.filter((member) =>
              member.name.toLowerCase().includes(normalizedQuery),
            );
            const teamTotal = team.totalPoints;

            const removeMember = async (member: TeamMember) => {
              try {
                setNotice('');
                await removeTeamMemberMutation.mutateAsync({
                  teamId: team.id,
                  studentId: member.id,
                });
                setNotice(`Участник «${member.name}» удалён из команды`);
              } catch (removeError) {
                if (removeError instanceof AuthApiError) {
                  setNotice(removeError.message);
                } else {
                  setNotice('Не удалось удалить участника из команды');
                }
              }
            };

            return (
              <section className={`team-panel team-panel--main team-list-panel${collapsed ? ' team-panel--collapsed' : ''}`} key={team.id}>
                <div className="team-panel__head">
                  <div className="team-panel__icon" style={{ background: team.color }}>
                    {team.title.trim()[0]?.toUpperCase() ?? 'К'}
                  </div>
                  <div>
                    <h2>{team.title}</h2>
                    <p>
                      {team.count} · {formatTeamPointsLabel(teamTotal)}
                    </p>
                  </div>
                  <div className="team-panel__actions">
                    {collapsed ? (
                      <>
                        <button className="team-primary-button team-clickable" type="button" onClick={() => toggleTeamPanel(team.id)}>
                          Редактировать
                        </button>
                        <button className="team-icon-button team-clickable" type="button" aria-label="Развернуть" onClick={() => toggleTeamPanel(team.id)}>
                          <img src="/Button-down.svg" alt="" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="team-danger-button team-clickable" type="button" onClick={() => void deleteTeam(team)}>
                          Удалить
                        </button>
                        <button className="team-light-button team-clickable" type="button" onClick={() => void saveTeam(team)}>
                          Сохранить
                        </button>
                        <button className="team-icon-button team-clickable" type="button" aria-label="Свернуть" onClick={() => toggleTeamPanel(team.id)}>
                          <img src="/Button.svg" alt="" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!collapsed && (
                  <div className="team-panel__body">
                    <div className="team-tools">
                      <div className="team-search">
                        <input
                          value={team.title}
                          placeholder="Название команды"
                          onChange={(event) => updateTeamField(team.id, { title: event.target.value })}
                        />
                      </div>
                      <div className="team-search">
                        <input
                          type="number"
                          min={1}
                          value={team.number}
                          placeholder="Номер команды"
                          onChange={(event) => updateTeamField(team.id, { number: Math.max(1, Number(event.target.value) || 1) })}
                        />
                      </div>
                    </div>

                    <div className="team-tools">
                      <div className="team-search">
                        <input
                          value={query}
                          placeholder="Поиск участников"
                          onChange={(event) => setQuery(event.target.value)}
                        />
                      </div>
                    </div>

                    <TeamMembersTable
                      teamId={team.id}
                      members={teamMembers}
                      memberColors={memberColors}
                      activeMemberId={activeMemberId}
                      memberScores={memberScores}
                      onSelectMember={setActiveMemberId}
                      onRemoveMember={(member) => void removeMember(member)}
                      onScoreChange={updateMemberScore}
                      emptyMessage={
                        team.members.length === 0
                          ? 'В команде пока нет участников. Добавьте их при создании команды.'
                          : normalizedQuery
                            ? 'Участники по вашему запросу не найдены.'
                            : 'Участники не найдены.'
                      }
                    />
                  </div>
                )}
              </section>
            );
          })}
        </section>
      )}
    </section>
  );
}
