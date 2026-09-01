const DATE_DIGITS_LENGTH = 6;
const TIME_DIGITS_LENGTH = 4;

export function extractActivityDateDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, DATE_DIGITS_LENGTH);
}

export function extractActivityTimeDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, TIME_DIGITS_LENGTH);
}

export function formatActivityDateDigits(digits: string) {
  const value = digits.slice(0, DATE_DIGITS_LENGTH);

  if (value.length === 0) {
    return '';
  }

  if (value.length <= 2) {
    return value;
  }

  if (value.length <= 4) {
    return `${value.slice(0, 2)}.${value.slice(2)}`;
  }

  return `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
}

export function formatActivityTimeDigits(digits: string) {
  const value = digits.slice(0, TIME_DIGITS_LENGTH);

  if (value.length === 0) {
    return '';
  }

  if (value.length <= 2) {
    return value;
  }

  return `${value.slice(0, 2)}:${value.slice(2)}`;
}

function fullYearFromTwoDigits(yearPart: number) {
  return 2000 + yearPart;
}

export function validateActivityDateLive(digits: string) {
  if (digits.length === 0) {
    return null;
  }

  if (digits.length >= 2) {
    const day = Number.parseInt(digits.slice(0, 2), 10);

    if (day < 1 || day > 31) {
      return 'Некорректный день';
    }
  }

  if (digits.length >= 4) {
    const month = Number.parseInt(digits.slice(2, 4), 10);

    if (month < 1 || month > 12) {
      return 'Некорректный месяц';
    }
  }

  if (digits.length === DATE_DIGITS_LENGTH) {
    return validateActivityDate(digits);
  }

  return null;
}

export function validateActivityDate(digits: string) {
  if (digits.length === 0) {
    return 'Укажите дату';
  }

  if (digits.length !== DATE_DIGITS_LENGTH) {
    return 'Введите дату в формате ДД.ММ.ГГ';
  }

  const day = Number.parseInt(digits.slice(0, 2), 10);
  const month = Number.parseInt(digits.slice(2, 4), 10);
  const yearPart = Number.parseInt(digits.slice(4, 6), 10);
  const year = fullYearFromTwoDigits(yearPart);

  if (month < 1 || month > 12) {
    return 'Некорректный месяц';
  }

  if (day < 1 || day > 31) {
    return 'Некорректный день';
  }

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return 'Такой даты не существует';
  }

  return null;
}

export function validateActivityTimeLive(digits: string) {
  if (digits.length === 0) {
    return null;
  }

  if (digits.length >= 2) {
    const hours = Number.parseInt(digits.slice(0, 2), 10);

    if (hours > 23) {
      return 'Часы от 00 до 23';
    }
  }

  if (digits.length >= 3) {
    const minutesDigit = Number.parseInt(digits.slice(2, 3), 10);

    if (digits.length === 3 && minutesDigit > 5) {
      return 'Минуты от 00 до 59';
    }
  }

  if (digits.length === TIME_DIGITS_LENGTH) {
    return validateActivityTime(digits);
  }

  return null;
}

export function validateActivityTime(digits: string) {
  if (digits.length === 0) {
    return 'Укажите время';
  }

  if (digits.length !== TIME_DIGITS_LENGTH) {
    return 'Введите время в формате ЧЧ:ММ';
  }

  const hours = Number.parseInt(digits.slice(0, 2), 10);
  const minutes = Number.parseInt(digits.slice(2, 4), 10);

  if (hours > 23) {
    return 'Часы от 00 до 23';
  }

  if (minutes > 59) {
    return 'Минуты от 00 до 59';
  }

  return null;
}
