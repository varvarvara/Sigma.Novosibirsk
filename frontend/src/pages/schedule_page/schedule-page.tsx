import { useEffect, useMemo, useRef, useState } from 'react'
import { MarkerPin01 } from '@untitledui/icons/MarkerPin01'
import { User01 } from '@untitledui/icons/User01'
import { Navbar } from '../../widgets/navbar/navbar'
import { addDays, getDayLabel } from './schedule-page.utils'
import type { ScheduleItem } from './schedule-page.types'
import './schedule-page.css'

const DAYS_BEFORE = 60
const DAYS_AFTER = 120
const DEFAULT_ACTIVE_INDEX = DAYS_BEFORE

const mockItems: ScheduleItem[] = [
  {
    id: 'lesson-1',
    date: '2026-07-30',
    time_start: '9:00',
    time_end: '10:00',
    title: 'Название занятия',
    topic: 'Тема занятия',
    teacher: 'Фамилия Имя Отчество',
    room: '1230',
  },
  {
    id: 'lesson-2',
    date: '2026-07-30',
    time_start: '10:20',
    time_end: '11:20',
    title: 'Название занятия',
    topic: 'Тема занятия',
    teacher: 'Фамилия Имя Отчество',
    room: '1230',
  },
  {
    id: 'lesson-3',
    date: '2026-07-31',
    time_start: '12:40',
    time_end: '13:40',
    title: 'Название занятия',
    topic: 'Тема занятия',
    teacher: 'Фамилия Имя Отчество',
    room: '1230',
  },
]

function normalizeMonthLabel(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1)
}

function formatMonthTitle(date: Date) {
  const month = normalizeMonthLabel(date.toLocaleDateString('ru-RU', { month: 'long' }))
  return `${month}, ${date.getFullYear()}`
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

function buildDateRange(anchor: Date) {
  return Array.from({ length: DAYS_BEFORE + DAYS_AFTER + 1 }, (_, index) =>
    addDays(anchor, index - DAYS_BEFORE),
  )
}

function sortByTime(items: ScheduleItem[]) {
  return [...items].sort((left, right) => left.time_start.localeCompare(right.time_start))
}

function getInitialAnchorDate(items: ScheduleItem[]) {
  if (items.length === 0) {
    return new Date()
  }

  const today = new Date()
  const todayKey = toDateKey(today)

  const uniqueDates = Array.from(new Set(items.map((item) => item.date))).sort()

  if (uniqueDates.includes(todayKey)) {
    return fromDateKey(todayKey)
  }

  const nearestFuture = uniqueDates.find((key) => key > todayKey)
  if (nearestFuture) {
    return fromDateKey(nearestFuture)
  }

  return fromDateKey(uniqueDates[uniqueDates.length - 1])
}

export function SchedulePage() {
  const initialAnchorDate = useMemo(() => getInitialAnchorDate(mockItems), [])
  const days = useMemo(() => buildDateRange(initialAnchorDate), [initialAnchorDate])
  const [activeIndex, setActiveIndex] = useState(DEFAULT_ACTIVE_INDEX)
  const scrollFrameRef = useRef<number | null>(null)

  const daysRowRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([])

  const activeDate = days[activeIndex] ?? new Date()
  const activeDateKey = toDateKey(activeDate)
  const monthTitle = formatMonthTitle(activeDate)

  const dayItems = useMemo(
    () => sortByTime(mockItems.filter((item) => item.date === activeDateKey)),
    [activeDateKey],
  )

  const centerChip = (index: number, behavior: ScrollBehavior) => {
    const row = daysRowRef.current
    const chip = chipRefs.current[index]

    if (!row || !chip) {
      return
    }

    const nextLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2
    row.scrollTo({
      left: Math.max(0, nextLeft),
      behavior,
    })
  }

  const syncActiveDateByScroll = () => {
    const row = daysRowRef.current
    if (!row) {
      return
    }

    const viewportCenter = row.scrollLeft + row.clientWidth / 2
    let nearestIndex = activeIndex
    let nearestDistance = Number.POSITIVE_INFINITY

    chipRefs.current.forEach((chip, index) => {
      if (!chip) {
        return
      }

      const chipCenter = chip.offsetLeft + chip.offsetWidth / 2
      const distance = Math.abs(chipCenter - viewportCenter)

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    setActiveIndex((current) => (current === nearestIndex ? current : nearestIndex))
  }

  const handleDaysScroll = () => {
    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current)
    }

    scrollFrameRef.current = window.requestAnimationFrame(syncActiveDateByScroll)
  }

  useEffect(() => {
    centerChip(activeIndex, 'auto')

    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
      }
    }
  }, [])

  return (
    <main className="schedule-page">
      <header className="schedule-header">
        <h1 className="schedule-header__title">{monthTitle}</h1>

        <div className="schedule-days-mask">
          <div className="schedule-days-row" ref={daysRowRef} onScroll={handleDaysScroll}>
            {days.map((date, index) => (
              <button
                key={toDateKey(date)}
                ref={(node) => {
                  chipRefs.current[index] = node
                }}
                className={`schedule-day-chip ${index === activeIndex ? 'schedule-day-chip--active' : ''}`}
                type="button"
                onClick={() => {
                  setActiveIndex(index)
                  centerChip(index, 'smooth')
                }}
              >
                <span className="schedule-day-chip__weekday">{getDayLabel(date).toUpperCase()}</span>
                <span className="schedule-day-chip__number">{date.getDate()}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="schedule-content">
        {dayItems.length === 0 ? (
          <article className="schedule-card schedule-card--empty">
            <div className="schedule-card__middle schedule-card__middle--empty">
              <p className="schedule-card__topic">На эту дату занятий пока нет</p>
            </div>
          </article>
        ) : (
          dayItems.map((item) => (
            <article className="schedule-card" key={item.id}>
              <div className="schedule-card__top">
                <h2 className="schedule-card__title">{item.title}</h2>
                <span className="schedule-card__time">
                  {item.time_start} - {item.time_end}
                </span>
              </div>

              <div className="schedule-card__middle">
                <p className="schedule-card__topic">{item.topic}</p>
              </div>

              <div className="schedule-card__bottom">
                <div className="schedule-card__info">
                  <User01 />
                  <p className="schedule-card__teacher">{item.teacher}</p>
                </div>

                <div className="schedule-card__info">
                  <MarkerPin01 />
                  <p className="schedule-card__room">{item.room}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <Navbar currentPath="/schedule" />
    </main>
  )
}
