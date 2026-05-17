export const MIN_BIRTH_YEAR = 1900

export function validateBirthDate(day: string, month: string, year: string) {
  const d = day.trim()
  const m = month.trim()
  const y = year.trim()
  const currentYear = new Date().getFullYear()

  if (!d || !m || !y) {
    return 'Укажите полную дату рождения.'
  }

  if (!/^\d{2}$/.test(d) || !/^\d{2}$/.test(m) || !/^\d{4}$/.test(y)) {
    return 'Формат даты: DD.MM.YYYY.'
  }

  const dayNumber = Number(d)
  const monthNumber = Number(m)
  const yearNumber = Number(y)

  if (dayNumber < 1 || dayNumber > 31) {
    return 'День должен быть от 1 до 31.'
  }

  if (monthNumber < 1 || monthNumber > 12) {
    return 'Месяц должен быть от 1 до 12.'
  }

  if (yearNumber < MIN_BIRTH_YEAR || yearNumber > currentYear) {
    return `Год должен быть от ${MIN_BIRTH_YEAR} до ${currentYear}.`
  }

  const date = new Date(yearNumber, monthNumber - 1, dayNumber)
  if (
    date.getFullYear() !== yearNumber ||
    date.getMonth() !== monthNumber - 1 ||
    date.getDate() !== dayNumber
  ) {
    return 'Введите корректную дату рождения.'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (date > today) {
    return 'Дата рождения не может быть в будущем.'
  }

  return null
}

export function validateBirthDateLive(day: string, month: string, year: string) {
  const d = day.trim()
  const m = month.trim()
  const y = year.trim()
  const currentYear = new Date().getFullYear()

  if (!d && !m && !y) {
    return null
  }

  if (d.length === 2) {
    const dayNumber = Number(d)
    if (dayNumber < 1 || dayNumber > 31) {
      return 'День должен быть от 1 до 31.'
    }
  }

  if (m.length === 2) {
    const monthNumber = Number(m)
    if (monthNumber < 1 || monthNumber > 12) {
      return 'Месяц должен быть от 1 до 12.'
    }
  }

  if (y.length === 4) {
    const yearNumber = Number(y)
    if (yearNumber < MIN_BIRTH_YEAR || yearNumber > currentYear) {
      return `Год должен быть от ${MIN_BIRTH_YEAR} до ${currentYear}.`
    }
  }

  if (d.length === 2 && m.length === 2 && y.length === 4) {
    return validateBirthDate(d, m, y)
  }

  return null
}
