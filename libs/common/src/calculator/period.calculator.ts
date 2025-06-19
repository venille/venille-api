import { addDays, differenceInDays } from 'date-fns';

export function predictOvulationDate(
  periods: { startDate: Date }[],
): Date | null {
  if (!periods || periods.length < 2) return null;

  // Sort by startDate descending
  const sorted = periods
    .filter((p) => p.startDate)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );

  const lastPeriodStart = new Date(sorted[0].startDate);
  const previousPeriodStart = new Date(sorted[1].startDate);

  const cycleLength = differenceInDays(lastPeriodStart, previousPeriodStart);
  const ovulationOffset = cycleLength - 14;

  return addDays(lastPeriodStart, ovulationOffset);
}

export function calculateCycleDayCount(
  currentDate: Date,
  baseDate: Date | null,
  cycleLengthDays: number,
): number {
  if (!baseDate) return 0;

  const daysSinceBase = Math.floor(
    (currentDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Calculate which cycle we're in and which day of that cycle
  const cycleNumber = Math.floor(daysSinceBase / cycleLengthDays);
  const dayInCurrentCycle = (daysSinceBase % cycleLengthDays) + 1;

  return dayInCurrentCycle;
}
