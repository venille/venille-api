export const getSlicedDate = new Date().toISOString().slice(0, 10);

export const isSameDay = (date1: Date, date2: Date) => {
  const date1Str = date1.toISOString().slice(0, 10);
  const date2Str = date2.toISOString().slice(0, 10);
  return date1Str === date2Str;
};

export const formatMonthTitle = (date: Date) => {
  const month = date.toLocaleString('default', { month: 'long' });

  const year = date.getFullYear();

  return `${month} ${year}`;
};

// Helper function to create a date in a specific timezone
export function createDateInTimezone(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const dateStr = `${parts.find((p) => p.type === 'year')?.value}-${parts.find((p) => p.type === 'month')?.value}-${parts.find((p) => p.type === 'day')?.value}T${parts.find((p) => p.type === 'hour')?.value}:${parts.find((p) => p.type === 'minute')?.value}:${parts.find((p) => p.type === 'second')?.value}`;

  return new Date(dateStr);
}

export interface WeekStartDates {
  previousWeek: Date;
  currentWeek: Date;
  nextWeek: Date;
}

export function getWeekStartDates(
  baseDate: Date = new Date(),
  timezone: string = 'Africa/Lagos',
): WeekStartDates {
  // Convert the baseDate to the specified timezone (defaults to Lagos)
  const workingDate = createDateInTimezone(baseDate, timezone);

  const dayOfWeek = workingDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysToMonday = (dayOfWeek + 6) % 7; // number of days since last Monday

  const currentMonday = new Date(workingDate);
  currentMonday.setDate(workingDate.getDate() - daysToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const previousMonday = new Date(currentMonday);
  previousMonday.setDate(currentMonday.getDate() - 7);

  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);

  return {
    previousWeek: previousMonday,
    currentWeek: currentMonday,
    nextWeek: nextMonday,
  };
}
