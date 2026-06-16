import { type CSSProperties, type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AuthApiError } from '../../../entities/auth';
import { getCurrentStudent, isStaffProfile } from '../../../entities/students/api/profile.api';
import { getTeacherTimetable } from '../../../entities/teacher/api/schedule.api';
import type { TeacherTimetableItem } from '../../../entities/teacher/model/schedule.types';
import { TeacherAppShell } from '../../../shared/ui/teacher_sidebar/teacher-app-shell';
import './teacher-schedule-styles.css';

type ViewMode = 'day' | 'week' | 'month';
type DayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Slot = {
  id: string;
  weekday: 1 | 2 | 3 | 4 | 5;
  start: string;
  end: string;
  course: string;
  room: string;
  students: number;
};

type PopoverState = {
  left: number;
  top: number;
  slot: Slot;
};

const STORAGE_MODE_KEY = 'teacher-schedule-view-mode';
const STORAGE_DATE_KEY = 'teacher-schedule-selected-date';

const scheduleStart = '08:00';
const scheduleEnd = '23:00';

const stepMinutes = 60;
const SCHEDULE_HEADER_HEIGHT_PX = 48;
const SCHEDULE_HOUR_HEIGHT_PX = 52;
const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const weekdayFullNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const modeLabels: Record<ViewMode, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const copy = startOfDay(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

function startOfWeek(date: Date) {
  const copy = startOfDay(date);
  const dayIndex = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - dayIndex);
  return copy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const safe = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${pad(hours)}:${pad(mins)}`;
}

function getNovosibirskTimeParts(date: Date) {
  const parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Novosibirsk',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);

  return { hour, minute };
}

function formatWeek(date: Date) {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${pad(start.getDate())}-${pad(end.getDate())} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${pad(start.getDate())} ${monthNames[start.getMonth()]} - ${pad(end.getDate())} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
}

function formatMonth(date: Date) {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function formatHeaderLabel(mode: ViewMode, date: Date) {
  if (mode === 'day') {
    return `${pad(date.getDate())} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (mode === 'week') {
    return formatWeek(date);
  }
  return formatMonth(date);
}

function buildMonthGrid(date: Date) {
  const firstOfMonth = startOfMonth(date);
  const lastOfMonth = endOfMonth(date);
  const gridStart = startOfWeek(firstOfMonth);
  const gridEnd = endOfWeek(lastOfMonth);
  const grid: Date[] = [];

  let current = gridStart;
  while (current <= gridEnd) {
    grid.push(current);
    current = addDays(current, 1);
  }

  return grid;
}

function buildWeekDays(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function formatLessonTime(value: string) {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

function timetableItemToSlot(item: TeacherTimetableItem): Slot {
  const date = fromDateKey(item.lesson_date);
  const weekday = date.getDay();
  const start = formatLessonTime(item.lesson_time);
  const end = minutesToTime(timeToMinutes(start) + 60);
  const classroom = item.classroom ? `каб. ${item.classroom}` : 'кабинет не назначен';

  return {
    id: `schedule-${item.schedule_id}`,
    weekday: (weekday >= 1 && weekday <= 5 ? weekday : 1) as Slot['weekday'],
    start,
    end,
    course: item.course_title,
    room: `Занятие ${item.class_number} · ${classroom}`,
    students: 0,
  };
}

function groupSlotsByDate(items: TeacherTimetableItem[]) {
  const map: Record<string, Slot[]> = {};

  for (const item of items) {
    const key = item.lesson_date;
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(timetableItemToSlot(item));
  }

  for (const key of Object.keys(map)) {
    map[key].sort((left, right) => left.start.localeCompare(right.start));
  }

  return map;
}

function getStoredMode() {
  if (typeof window === 'undefined') {
    return 'week' as ViewMode;
  }
  const value = window.localStorage.getItem(STORAGE_MODE_KEY);
  if (value === 'day' || value === 'week' || value === 'month') {
    return value;
  }
  return 'week';
}

function getStoredDate() {
  if (typeof window === 'undefined') {
    return startOfDay(new Date());
  }
  const value = window.localStorage.getItem(STORAGE_DATE_KEY);
  if (value) {
    const parsed = fromDateKey(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return startOfDay(new Date());
}

export function TeacherSchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => getStoredMode());
  const [selectedDate, setSelectedDate] = useState<Date>(() => getStoredDate());
  const [slotsByDate, setSlotsByDate] = useState<Record<string, Slot[]>>({});
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<PopoverState | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [renderedPopover, setRenderedPopover] = useState<PopoverState | null>(null);
  const [headerHover, setHeaderHover] = useState<'back' | 'forward' | null>(null);
  const modeMenuRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_DATE_KEY, toDateKey(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const loadSchedule = async () => {
      setIsScheduleLoading(true);
      setScheduleError(null);

      try {
        const user = await getCurrentStudent();
        if (!isStaffProfile(user)) {
          setSlotsByDate({});
          setScheduleError('Расписание доступно только преподавателям');
          return;
        }

        const items = await getTeacherTimetable(user.id);
        setSlotsByDate(groupSlotsByDate(items));
      } catch (error) {
        setSlotsByDate({});
        if (error instanceof AuthApiError) {
          setScheduleError(error.message);
        } else {
          setScheduleError('Не удалось загрузить расписание');
        }
      } finally {
        setIsScheduleLoading(false);
      }
    };

    void loadSchedule();
  }, []);

  const getDateSlots = (date: Date) => slotsByDate[toDateKey(date)] ?? [];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (modeMenuRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      if (target.closest('.teacher-schedule-slot')) return;
      setModeMenuOpen(false);
      setActivePopover(null);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);
  const monthGrid = useMemo(() => buildMonthGrid(selectedDate), [selectedDate]);

  const visibleDays = viewMode === 'day' ? [selectedDate] : weekDays;
  const headerLabel = formatHeaderLabel(viewMode, selectedDate);

  const TZ = { NOV: 7 * 60, LOCAL: 3 * 60 };
  const [displayTimezone, setDisplayTimezone] = useState<'NOV' | 'LOCAL'>('NOV');

  function convertFromNovToDisplay(time: string) {
    const displayOffset = displayTimezone === 'NOV' ? TZ.NOV : TZ.LOCAL;
    const m = timeToMinutes(time);
    const utc = m - TZ.NOV;
    const target = utc + displayOffset;
    return minutesToTime(target);
  }

  const displayScheduleStart = useMemo(() => convertFromNovToDisplay(scheduleStart), [displayTimezone]);
  const displayScheduleEnd = useMemo(() => convertFromNovToDisplay(scheduleEnd), [displayTimezone]);
  const hourStartMinute = timeToMinutes(displayScheduleStart);
  const hourEndMinute = timeToMinutes(displayScheduleEnd);
  const hourLabels = useMemo(() => {
    const labels: string[] = [];
    for (let m = hourStartMinute; m < hourEndMinute; m += 60) {
      labels.push(minutesToTime(m));
    }
    return labels;
  }, [hourStartMinute, hourEndMinute]);

  const [nowDisplayMinutes, setNowDisplayMinutes] = useState<number | null>(null);
  const [nowNovosibirskLabel, setNowNovosibirskLabel] = useState('');

  useEffect(() => {
    const updateNowLine = () => {
      const now = new Date();
      const utc = now.getUTCHours() * 60 + now.getUTCMinutes();
      const displayOffset = displayTimezone === 'NOV' ? TZ.NOV : TZ.LOCAL;
      const displayMinutes = ((utc + displayOffset) % 1440 + 1440) % 1440;
      const novosibirskTime = getNovosibirskTimeParts(now);

      setNowDisplayMinutes(displayMinutes);
      setNowNovosibirskLabel(`${pad(novosibirskTime.hour)}:${pad(novosibirskTime.minute)}`);
    };

    updateNowLine();
    const intervalId = window.setInterval(updateNowLine, 30000);

    return () => window.clearInterval(intervalId);
  }, [displayTimezone]);

  function shiftDate(direction: -1 | 1) {
    setSelectedDate((current) => {
      if (viewMode === 'day') return addDays(current, direction);
      if (viewMode === 'week') return addDays(current, direction * 7);
      return addMonths(current, direction);
    });
  }

  function handleSlotClick(slot: Slot, event: ReactMouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const clientX = event.clientX;
    const clientY = event.clientY;

    const POPUP_W = 320;
    const POPUP_H = 200;
    const padding = 12;
    const left = Math.min(Math.max(clientX + 12, padding), window.innerWidth - POPUP_W - padding);
    const top = Math.min(Math.max(clientY + 8, padding), window.innerHeight - POPUP_H - padding);

    setActivePopover((current) => {
      if (current?.slot.id === slot.id) return null;
      return { slot, left, top };
    });
  }

  useEffect(() => {
    let timeoutId: number | undefined;
    let enterId: number | undefined;
    if (activePopover) {
      setRenderedPopover(activePopover);
      setPopoverOpen(false);
      enterId = window.setTimeout(() => setPopoverOpen(true), 20);
    } else {
      setPopoverOpen(false);
      timeoutId = window.setTimeout(() => setRenderedPopover(null), 220);
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (enterId) window.clearTimeout(enterId);
    };
  }, [activePopover]);

  const timelineSlots = visibleDays.flatMap((date, dayIndex) =>
    getDateSlots(date).map((slot) => ({ slot, dayIndex })),
  );

  return (
    <TeacherAppShell className="teacher-schedule-layout">
      <main className="teacher-schedule-main">
        <div className="teacher-schedule-content">
          {isScheduleLoading ? <p className="teacher-schedule-status">Загрузка расписания...</p> : null}
          {scheduleError ? <p className="teacher-schedule-status teacher-schedule-status--error">{scheduleError}</p> : null}
          <header className="teacher-schedule-header">
            <div className="teacher-schedule-header-left">
              <button
                type="button"
                className="teacher-schedule-nav-button"
                aria-label="Назад"
                onMouseEnter={() => setHeaderHover('back')}
                onMouseLeave={() => setHeaderHover(null)}
                onClick={() => shiftDate(-1)}
              >
                <img src="/Back-Button.svg" alt="" aria-hidden="true" />
                {headerHover === 'back' ? (
                  <span className="teacher-schedule-tooltip teacher-schedule-tooltip-left">Назад</span>
                ) : null}
              </button>

              <div className="teacher-schedule-header-date" style={{ margin: '0 12px' }}>{headerLabel}</div>

              <div className="teacher-schedule-mode-switch" ref={modeMenuRef}>
                <button
                  type="button"
                  className="teacher-schedule-mode-switch-button"
                  onClick={() => setModeMenuOpen((current) => !current)}
                >
                  {modeLabels[viewMode]}
                </button>
                {modeMenuOpen ? (
                  <div className="teacher-schedule-mode-menu" role="menu">
                    {(Object.keys(modeLabels) as ViewMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`teacher-schedule-mode-menu-item ${viewMode === mode ? 'active' : ''}`}
                        onClick={() => {
                          setViewMode(mode);
                          setModeMenuOpen(false);
                        }}
                      >
                        {modeLabels[mode]}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="teacher-schedule-nav-button-forward"
                aria-label="Вперед"
                onMouseEnter={() => setHeaderHover('forward')}
                onMouseLeave={() => setHeaderHover(null)}
                onClick={() => shiftDate(1)}
              >
                <img src="/Back-Button.svg" alt="" aria-hidden="true" />
                {headerHover === 'forward' ? (
                  <span className="teacher-schedule-tooltip teacher-schedule-tooltip-right">Вперед</span>
                ) : null}
              </button>
            </div>
          </header>

          {viewMode === 'month' ? (
            <section className="teacher-schedule-grid-card teacher-schedule-grid-card-month">
              <div className="teacher-schedule-month-grid">
                <div className="teacher-schedule-month-weekdays">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((weekday) => (
                    <div key={weekday} className="teacher-schedule-month-head">
                      {weekday}
                    </div>
                  ))}
                </div>

                <div className="teacher-schedule-month-days">
                {monthGrid.map((date) => {
                  const dateKey = toDateKey(date);
                  const inCurrentMonth = date.getMonth() === selectedDate.getMonth();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isSelectedDay = dateKey === toDateKey(selectedDate);
                  const slots = getDateSlots(date);
                  return (
                    <button
                      key={dateKey}
                      type="button"
                      className={`teacher-schedule-month-cell${inCurrentMonth ? '' : ' outside-month'}${isWeekend ? ' weekend' : ''}${isSelectedDay ? ' is-selected' : ''}`}
                      onClick={() => {
                        setSelectedDate(date);
                        setViewMode('day');
                      }}
                    >
                      <div className="teacher-schedule-month-cell-date">
                        <span>{date.getDate()}</span>
                      </div>
                      <div className="teacher-schedule-month-cell-items">
                        {slots.slice(0, 2).map((slot) => (
                          <span key={slot.id} className="teacher-schedule-month-chip">
                            {slot.course} · {slot.start}
                          </span>
                        ))}
                        {slots.length > 2 ? <span className="teacher-schedule-month-more">+{slots.length - 2}</span> : null}
                      </div>
                    </button>
                  );
                })}
                </div>
              </div>
            </section>
          ) : (
            <section className="teacher-schedule-grid-card">
              <div className="teacher-schedule-timeline-scroll">
              <div
                className={`teacher-schedule-timeline ${viewMode === 'day' ? 'teacher-schedule-timeline--day' : 'teacher-schedule-timeline--week'}`}
                style={{
                  gridTemplateColumns:
                    viewMode === 'day'
                      ? '72px minmax(0, 1fr)'
                      : `72px repeat(${visibleDays.length}, minmax(120px, 1fr))`,
                  gridTemplateRows: `${SCHEDULE_HEADER_HEIGHT_PX}px repeat(${hourLabels.length}, ${SCHEDULE_HOUR_HEIGHT_PX}px)`,
                }}
              >
                <div className="teacher-schedule-time-header" aria-hidden="true" />
                {visibleDays.map((date, dayIndex) => (
                  <div
                    key={toDateKey(date)}
                    className={`teacher-schedule-day-header clickable`}
                    style={{ gridColumn: dayIndex + 2 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedDate(date);
                      setViewMode('day');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDate(date);
                        setViewMode('day');
                      }
                    }}
                    aria-label={`Открыть день ${pad(date.getDate())} ${monthNames[date.getMonth()]}`}
                  >
                    <span className="teacher-schedule-day-header-weekday">{weekdayFullNames[date.getDay()]}</span>
                    <span className="teacher-schedule-day-header-date">{pad(date.getDate())}</span>
                  </div>
                ))}
                {hourLabels.map((time, rowIndex) => (
                  <div key={time} className="teacher-schedule-time-label" style={{ gridRow: rowIndex + 2 }}>
                    {time}
                  </div>
                ))}

                {hourLabels.map((t, rowIndex) =>
                  visibleDays.map((date, dayIndex) => (
                    <div
                      key={`${toDateKey(date)}-${t}`}
                      className={`teacher-schedule-cell ${t.endsWith(':00') ? 'hour-mark' : ''} ${date.getDay() === 0 || date.getDay() === 6 ? 'weekend' : ''}`}
                      style={{ gridColumn: dayIndex + 2, gridRow: rowIndex + 2 }}
                    />
                  )),
                )}

                {timelineSlots.map(({ slot, dayIndex }) => {
                  const dispStart = convertFromNovToDisplay(slot.start);
                  const dispEnd = convertFromNovToDisplay(slot.end);
                  const startRow = Math.max(0, Math.floor((timeToMinutes(dispStart) - hourStartMinute) / stepMinutes));
                  const minutesIntoHour = timeToMinutes(dispStart) % 60;
                  const durationMinutes = timeToMinutes(dispEnd) - timeToMinutes(dispStart);
                  const rowSpan = Math.ceil((minutesIntoHour + durationMinutes) / 60);
                  const offsetPixels = (minutesIntoHour / 60) * SCHEDULE_HOUR_HEIGHT_PX;
                  const heightPixels = (durationMinutes / 60) * SCHEDULE_HOUR_HEIGHT_PX;
                  return (
                    <div
                      key={`${dayIndex}-${slot.id}`}
                      className="teacher-schedule-slot"
                      style={{
                        gridColumn: dayIndex + 2,
                        gridRow: `${startRow + 2} / span ${rowSpan}`,
                      }}
                    >
                      <button
                        className="teacher-schedule-slot-inner"
                        type="button"
                        style={{
                          position: 'absolute',
                          top: `${offsetPixels}px`,
                          height: `${heightPixels}px`,
                          left: '6px',
                          right: '6px',
                        }}
                        onClick={(event) => handleSlotClick(slot, event)}
                      >
                        <span className="teacher-schedule-slot-title">{slot.course}</span>
                        <span className="teacher-schedule-slot-room">{slot.room}</span>
                        <span className="teacher-schedule-slot-meta">
                          {dispStart} - {dispEnd}
                        </span>
                      </button>
                    </div>
                  );
                })}
                {/* current time line for Day/Week views */}
                {viewMode !== 'month' && nowDisplayMinutes !== null && (
                  (() => {
                    const minutesFromStart = nowDisplayMinutes - hourStartMinute;
                    const totalRange = hourEndMinute - hourStartMinute;
                    const clamped = Math.max(0, Math.min(minutesFromStart, totalRange));
                    const topPixels = SCHEDULE_HEADER_HEIGHT_PX + (clamped / 60) * SCHEDULE_HOUR_HEIGHT_PX;
                    const outOfRange = minutesFromStart < 0 || minutesFromStart > totalRange;
                    return (
                      <>
                        <div className={`teacher-schedule-now-line ${outOfRange ? 'outside' : ''}`} style={{ top: `${topPixels}px` }}>
                          <span className="teacher-schedule-now-time-label">{nowNovosibirskLabel}</span>
                        </div>
                        <div className={`teacher-schedule-now-marker ${outOfRange ? 'outside' : ''}`} style={{ top: `${topPixels - 4}px` }} />
                      </>
                    );
                  })()
                )}
              </div>
              </div>
            </section>
          )}

          {renderedPopover ? (
            <div
              ref={popoverRef}
              className={`teacher-schedule-popover ${popoverOpen ? 'open' : ''}`}
              style={{ left: renderedPopover.left, top: renderedPopover.top } as CSSProperties}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="teacher-schedule-popover-title">{renderedPopover.slot.course}</div>
              <div className="teacher-schedule-popover-line">
                {renderedPopover.slot.start} - {renderedPopover.slot.end}
              </div>
              <div className="teacher-schedule-popover-line">{renderedPopover.slot.room}</div>
              <div className="teacher-schedule-popover-line">{renderedPopover.slot.students} учеников</div>
            </div>
          ) : null}
        </div>
      </main>
    </TeacherAppShell>
  );
}
