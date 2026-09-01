import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { warmRoute } from '../../../app/route-warmers';
import { AuthApiError } from '../../../entities/auth';
import {
  useCreateTeamMemberMutation,
  useCreateTeamMutation,
  useListTeamsQuery,
} from '../../../entities/organizer/queries/extracurricular.queries';
import type { SeasonStudent } from '../../../entities/organizer/model/season.types';
import { useSeasonStudentsQuery } from '../../../entities/organizer/queries/season.queries';
import { DEFAULT_SEASON_ID } from '../../../features/auth/student-registration';
import './team-creation-page.css';

function formatStudentName(student: SeasonStudent) {
  return `${student.first_name} ${student.last_name}`.trim();
}

function formatMemberName(name: string) {
  const [firstName = '', lastName = ''] = name.split(' ');

  if (!lastName) {
    return firstName;
  }

  return `${lastName} ${firstName[0]}.`;
}

export default function TeamCreationContent() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const {
    data: students = [],
    isLoading,
    error: studentsError,
  } = useSeasonStudentsQuery(DEFAULT_SEASON_ID);
  const { data: teams = [], error: teamsError } = useListTeamsQuery();
  const createTeamMutation = useCreateTeamMutation();
  const createTeamMemberMutation = useCreateTeamMemberMutation();
  const isSaving = createTeamMutation.isPending || createTeamMemberMutation.isPending;
  const loadError =
    studentsError instanceof AuthApiError ? studentsError.message :
    teamsError instanceof AuthApiError ? teamsError.message :
    studentsError || teamsError ? 'Не удалось загрузить участников' : null;

  const selectedMembers = useMemo(
    () => students.filter((student) => memberIds.includes(student.id)),
    [memberIds, students],
  );

  const filteredCandidates = useMemo(() => {
    const query = memberName.trim().toLowerCase();

    return students.filter((candidate) => {
      if (!query) {
        return true;
      }

      return formatStudentName(candidate).toLowerCase().includes(query);
    });
  }, [memberName, students]);

  const warmTeamFormationRoute = () => warmRoute('/team-formation');

  const openTeamFormation = () => {
    warmTeamFormationRoute();
    navigate({ to: '/team-formation' });
  };

  const addMember = (student: SeasonStudent) => {
    setMemberIds((items) => (items.includes(student.id) ? items : [...items, student.id]));
    setMemberName('');
  };

  const createTeam = async () => {
    const trimmedName = teamName.trim() || 'Название команды';
    setError(null);

    try {
      const nextTeamNumber =
        teams.reduce((max, team) => Math.max(max, team.ex_team_number), 0) + 1;

      const createdTeam = await createTeamMutation.mutateAsync({
        ex_team_number: nextTeamNumber,
        ex_team_name: trimmedName,
        season_id: DEFAULT_SEASON_ID,
      });

      await Promise.all(
        memberIds.map((studentId) =>
          createTeamMemberMutation.mutateAsync({
            team_id: createdTeam.id,
            student_id: studentId,
            season_id: DEFAULT_SEASON_ID,
          }),
        ),
      );

      warmTeamFormationRoute();
      navigate({ to: '/team-formation' });
    } catch (saveError) {
      if (saveError instanceof AuthApiError) {
        setError(saveError.message);
      } else {
        setError('Не удалось создать команду');
      }
    }
  };

  return (
    <section className="org-layout__workspace team-creation-workspace">
      <header className="team-creation-header">
        <div className="team-creation-header__left">
          <h1>Создание команды</h1>
          <p>Заполните данные и выберите участников</p>
        </div>
        <div className="team-creation-header__actions">
          <button
            className="team-creation-light-button team-creation-clickable"
            type="button"
            onClick={openTeamFormation}
            onPointerEnter={warmTeamFormationRoute}
            onPointerDown={warmTeamFormationRoute}
            onFocus={warmTeamFormationRoute}
          >
            Отмена
          </button>
          <button
            className="team-creation-primary-button team-creation-clickable"
            type="button"
            onClick={() => void createTeam()}
            onPointerEnter={warmTeamFormationRoute}
            onPointerDown={warmTeamFormationRoute}
            onFocus={warmTeamFormationRoute}
            disabled={isSaving}
          >
            {isSaving ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </header>

      {error || loadError ? <p className="team-creation-status">{error ?? loadError}</p> : null}
      {isLoading ? <p className="team-creation-status">Загрузка участников...</p> : null}

      <section className="team-creation-form" aria-label="Параметры команды">
        <label className="team-creation-field">
          <span>Название команды</span>
          <input value={teamName} placeholder="Например: Сигма-тим" onChange={(event) => setTeamName(event.target.value)} />
        </label>

        <div className="team-creation-section-head">
          <h2 className="team-creation-section-title">Выберите участников</h2>
          <span>Добавлено: {selectedMembers.length}</span>
        </div>

        <div className="team-creation-tags" aria-label="Участники команды">
          {selectedMembers.map((member) => (
            <button
              className="team-creation-tag team-creation-clickable"
              type="button"
              key={member.id}
              onClick={() => setMemberIds((items) => items.filter((id) => id !== member.id))}
            >
              <span>{formatMemberName(formatStudentName(member))}</span>
              <span className="team-creation-tag__remove">×</span>
            </button>
          ))}
        </div>

        <div className="team-creation-add-row">
          <input value={memberName} placeholder="Введите ФИО участника" onChange={(event) => setMemberName(event.target.value)} />
        </div>

        <div className="team-creation-search-results" aria-label="Найденные участники">
          {filteredCandidates.map((candidate) => (
            <div className="team-creation-search-result" key={candidate.id}>
              <span className="team-creation-search-result__person">
                {candidate.avatar_url ? (
                  <img className="team-creation-search-result__avatar" src={candidate.avatar_url} alt="" />
                ) : (
                  <span className="team-creation-search-result__avatar team-creation-search-result__avatar--fallback">
                    {formatStudentName(candidate)[0]}
                  </span>
                )}
                <span>{formatStudentName(candidate)}</span>
              </span>
              {memberIds.includes(candidate.id) ? (
                <button
                  className="team-creation-remove team-creation-clickable"
                  type="button"
                  aria-label={`Удалить ${formatStudentName(candidate)}`}
                  onClick={() => setMemberIds((items) => items.filter((id) => id !== candidate.id))}
                >
                  ×
                </button>
              ) : (
                <button
                  className="team-creation-add-button team-creation-clickable"
                  type="button"
                  aria-label={`Добавить ${formatStudentName(candidate)}`}
                  onClick={() => addMember(candidate)}
                >
                  <img src="/Button-add.svg" alt="" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
