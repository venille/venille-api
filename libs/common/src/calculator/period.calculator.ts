import {
  addDays,
  differenceInDays,
  isWithinInterval,
  startOfDay,
  addMonths,
  isBefore,
  isSameDay,
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


export function generateDailyInsight({
  currentDate,
  periodStartDate,
  periodEndDate,
  ovulationDate,
  cycleStartDate,
  cycleLengthDays,
}: {
  currentDate: Date;
  periodStartDate: Date;
  periodEndDate: Date;
  ovulationDate: Date;
  cycleStartDate: Date;
  cycleLengthDays: number;
}): string {
  const fertileWindowStart = addDays(ovulationDate, -3);
  const fertileWindowEnd = addDays(ovulationDate, 2);
  const nextPeriodStart = addDays(cycleStartDate, cycleLengthDays);

  if (
    isWithinInterval(currentDate, {
      start: periodStartDate,
      end: periodEndDate,
    })
  ) {
    const day = differenceInDays(currentDate, periodStartDate) + 1;
    return `Menstrual Phase - Day ${day}\nLow chance of pregnancy`;
  }

  if (
    isWithinInterval(currentDate, {
      start: addDays(periodEndDate, 1),
      end: addDays(fertileWindowStart, -1),
    })
  ) {
    return `Follicular Phase\nHormones rising, egg maturing\nModerate chance of pregnancy`;
  }

  if (
    isWithinInterval(currentDate, {
      start: fertileWindowStart,
      end: fertileWindowEnd,
    })
  ) {
    if (isSameDay(currentDate, ovulationDate)) {
      return `Ovulation Day\nEgg released\nHighest chance of pregnancy`;
    }
    return `Ovulation Phase\nFertile window\nHigh chance of pregnancy`;
  }

  if (
    isWithinInterval(currentDate, {
      start: addDays(fertileWindowEnd, 0),
      end: addDays(nextPeriodStart, 0),
    })
  ) {
    return `Luteal Phase\nBody preparing for next cycle\nLow chance of pregnancy`;
  }

  return `Regular cycle day`;
}