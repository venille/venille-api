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
export function calculateFollicularPhaseLength(cycleLength: number): number {
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


// Calculates which day of the cycle a given date is
export function calculateCycleDayCount(
  targetDate: Date,
  lastPeriodStart: Date,
  cycleLength: number,
): { cycleDay: number; cycleStartDate: Date; cycleLength: number } {
  const daysSinceStart = differenceInDays(
    startOfDay(targetDate),
    startOfDay(lastPeriodStart),
  );

  // Calculate which cycle we're in
  const cycleIndex = Math.floor(daysSinceStart / cycleLength);
  const cycleStartDate = addDays(lastPeriodStart, cycleIndex * cycleLength);

  // Calculate the day within that cycle
  const cycleDay = daysSinceStart % cycleLength;

  return { cycleDay, cycleStartDate, cycleLength };
}

export interface PredictedPeriodInfo {
  startDate: Date;
  endDate: Date;
  ovulationDate: Date;
}
