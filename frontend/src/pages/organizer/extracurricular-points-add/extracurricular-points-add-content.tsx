import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { AuthApiError } from '../../../entities/auth';
import { DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE } from '../../../entities/organizer/api/extracurricular.api';
import {
  useListActivitiesQuery,
  useListScoresQuery,
  useListTeamsQuery,
  useMarkTeamAttendanceMutation,
} from '../../../entities/organizer/queries/extracurricular.queries';
import { DEFAULT_SEASON_ID } from '../../../features/auth/student-registration';
import { formatResponsible } from '../../../features/extracurricular-attendance/lib/format-responsible';
import { buildTeamScores, type TeamScore } from '../../../features/extracurricular-attendance/model/team-score';
import './extracurricular-points-add.css';

export default function ExtracurricularPointsAddContent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/extracurricular-points-add' });
  const [teams, setTeams] = useState<TeamScore[]>([]);
  const [notice, setNotice] = useState('Черновик');

  const activityId = search.activityId;
  const title = search.title ?? 'Название';
  const date = search.date ?? '—';
  const time = search.time ?? '—';
  const organizer = search.organizer ?? '—';

  const {
    data: apiTeams = [],
    isLoading: isTeamLoading,
    error: teamsError,
  } = useListTeamsQuery();

  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    error: activitiesError,
  } = useListActivitiesQuery();

  const {
    data: scores = [],
    isLoading: isScoresLoading,
    error: scoresError,
  } = useListScoresQuery();

  const attendanceMutation = useMarkTeamAttendanceMutation();

  const isLoading = isTeamLoading || isScoresLoading || isActivitiesLoading;

  const error = useMemo(() => {
    if (!activityId) {
      return 'Не выбрано мероприятие';
    }

    const queryError = teamsError ?? scoresError ?? activitiesError;

    if (!queryError) {
      return null;
    }

    if (queryError instanceof AuthApiError) {
      return queryError.message;
    }

    return 'Не удалось загрузить команды';
  }, [activityId, activitiesError, scoresError, teamsError]);

  const defaultPoints = useMemo(() => {
    if (!activityId) {
      return DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE;
    }

    const activity = activities.find((item) => item.id === activityId);
    return activity?.ex_course_score ?? DEFAULT_EXTRACURRICULAR_ACTIVITY_SCORE;
  }, [activities, activityId]);

  useEffect(() => {
    if (!activityId || error) {
      setTeams([]);
      return;
    }

    if (isLoading) {
      return;
    }

    setTeams(buildTeamScores(apiTeams, scores, activityId, defaultPoints));
  }, [activityId, apiTeams, defaultPoints, error, isLoading, scores]);

  const filteredTeams = teams;

  const updateTeam = (id: number, patch: Partial<TeamScore>) => {
    setTeams((items) => items.map((team) => (team.id === id ? { ...team, ...patch } : team)));
  };

  const savePoints = async () => {
    if (!activityId) {
      setNotice('Выберите мероприятие');
      return;
    }

    setNotice('Сохранение...');

    try {
      const visitedTeams = teams.filter((team) => team.visited);

      await Promise.all(
        visitedTeams.map(async (team) => {
          try {
            await attendanceMutation.mutateAsync({
              team_id: team.id,
              ex_course_id: activityId,
              season_id: DEFAULT_SEASON_ID,
            });
          } catch (saveError) {
            if (saveError instanceof AuthApiError && saveError.status === 400) {
              return;
            }
            throw saveError;
          }
        }),
      );

      setNotice('Сохранено');
      navigate({ to: '/org-extracurricular' });
    } catch (saveError) {
      if (saveError instanceof AuthApiError) {
        setNotice(saveError.message);
      } else {
        setNotice('Не удалось сохранить посещаемость');
      }
    }
  };

  return (
    <section className="org-layout__workspace points-workspace">
      <header className="points-header">
        <button className="points-back-button points-clickable" type="button" aria-label="Назад" onClick={() => navigate({ to: '/org-extracurricular' })}>
          <img src="/Back-Button.svg" alt="" />
        </button>
        <div className="points-header__left">
          <h1>{title}</h1>
          <p>{date} • {time} | Ответственный: {formatResponsible(organizer)}</p>
          <nav className="points-tabs" aria-label="Разделы внеучебки">
            <button className="points-tabs__item points-tabs__item--active points-clickable" type="button" onClick={() => navigate({ to: '/org-extracurricular' })}>Мероприятия</button>
            <button className="points-tabs__item points-clickable" type="button" onClick={() => navigate({ to: '/team-formation' })}>Команды</button>
            <button className="points-tabs__item points-clickable" type="button">Рейтинг</button>
          </nav>
        </div>
        <div className="points-header__actions" />
      </header>

      <div className="points-tools">
        <button
          className="points-light-button points-clickable"
          type="button"
          onClick={() => void savePoints()}
          disabled={attendanceMutation.isPending || isLoading || !activityId}
        >
          {attendanceMutation.isPending ? 'Сохранение...' : 'Сохранить посещаемость'}
        </button>
        {notice ? <span className="points-notice">{notice}</span> : null}
      </div>

      <section className="points-panel" aria-label="Начисление баллов">
        {isLoading ? <p className="points-status">Загрузка...</p> : null}
        {error ? <p className="points-status">{error}</p> : null}
        <div className="points-table" role="table" aria-label="Участники">
          <div className="points-table__header" role="row">
            <span>Команда</span>
            <span>Статус</span>
            <span>Баллы</span>
            <span />
          </div>
          <div className="points-table__body">
            {!isLoading && !error && filteredTeams.length === 0 ? (
              <p className="points-table__empty">Команд пока нет. Создайте команду в разделе «Команды».</p>
            ) : null}
            {filteredTeams.map((team) => (
              <div className="points-row" role="row" key={team.id}>
                <span className="points-row__person">
                  <span>{team.name}</span>
                </span>
                <button
                  className={`points-visit-toggle points-clickable${team.visited ? ' points-visit-toggle--active' : ''}`}
                  type="button"
                  onClick={() =>
                    updateTeam(team.id, {
                      visited: !team.visited,
                      points: team.visited ? 0 : defaultPoints,
                    })
                  }
                  aria-label={team.visited ? 'Присутствует' : 'Отсутствует'}
                >
                  <img src={team.visited ? '/present.svg' : '/absent.svg'} alt="" />
                </button>
                <input
                  className="points-input"
                  value={team.points}
                  inputMode="numeric"
                  readOnly
                />
                <button className="points-dropdown-button points-clickable" type="button" aria-label="Открыть">
                  <img src="/Dropdown.svg" alt="" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
