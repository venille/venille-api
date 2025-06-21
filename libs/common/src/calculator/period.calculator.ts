import {
  addDays,
  differenceInDays,
  isWithinInterval,
  startOfDay,
  addMonths,
  isBefore,
} from 'date-fns';

export interface PeriodRecord {
  start: Date;
  end: Date;
}

// Calculate follicular phase length based on cycle length using linear regression
// Based on research showing strong correlation between cycle length and follicular phase
function calculateFollicularPhaseLength(cycleLength: number): number {
  // Using coefficients from research: follicular = 0.501 * cycleLength - 0.088
  return Math.round(0.501 * cycleLength - 0.088);
}

/**
 * Predicts period length:
 * - If fewer than 2 period records, returns a default.
 * - Else calculates average length from history.
 */
export function predictPeriodLength(
  pastPeriods: PeriodRecord[],
  defaultLength: number = 5,
): number {
  if (!pastPeriods || pastPeriods.length < 2) {
    return defaultLength;
  }

  const total = pastPeriods.reduce((sum, p) => {
    const length = differenceInDays(p.end, p.start) + 1;
    return sum + Math.max(1, length); // at least 1 day
  }, 0);

  return Math.round(total / pastPeriods.length);
}

/**
 * Estimate ovulation date based on one or two period start dates.
 *
 * @param lastPeriodStart - Required. The most recent period start date.
 * @param previousPeriodStart - Optional. The period before the last.
 * @param fallbackCycleLength - Optional. Used only if previousPeriodStart is not provided. Default is 28.
 * @returns Estimated ovulation date.
 */
export function estimateOvulationDate(
  lastPeriodStart: Date,
  previousPeriodStart?: Date,
  fallbackCycleLength: number = 28,
): Date {
  const cycleLength = previousPeriodStart
    ? differenceInDays(lastPeriodStart, previousPeriodStart)
    : fallbackCycleLength;

  const estimatedOvulationDate = addDays(lastPeriodStart, cycleLength - 14);
  return estimatedOvulationDate;
}

export function calculateOvulationWindow(
  cycleLength: number,
  cycleStartDate: Date,
  previousPeriodStart?: Date,
): { start: Date; mid: Date; end: Date } {
  const ovulationMid = estimateOvulationDate(
    cycleStartDate,
    previousPeriodStart,
    cycleLength,
  );
  return {
    start: addDays(ovulationMid, -2),
    mid: ovulationMid,
    end: addDays(ovulationMid, 2),
  };
}

// Calculates which day of the cycle a given date is
export function calculateCycleDayCount(
  targetDate: Date,
  lastPeriodStart: Date,
  cycleLength: number,
): { cycleDay: number; cycleStartDate: Date } {
  const daysSinceStart = differenceInDays(
    startOfDay(targetDate),
    startOfDay(lastPeriodStart),
  );

  // Calculate which cycle we're in
  const cycleIndex = Math.floor(daysSinceStart / cycleLength);
  const cycleStartDate = addDays(lastPeriodStart, cycleIndex * cycleLength);

  // Calculate the day within that cycle
  const cycleDay = daysSinceStart % cycleLength;

  return { cycleDay, cycleStartDate };
}

export interface PredictedPeriodInfo {
  startDate: Date;
  endDate: Date;
  ovulationDate: Date;
}
