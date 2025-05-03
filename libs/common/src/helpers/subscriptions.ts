export function calculateSubscriptionExpirationDate(
  duration: number,
  duration_bonus: number,
): Date {
  const currentDate = new Date();

  currentDate.setDate(currentDate.getDate() + (duration + duration_bonus));

  return currentDate;
}

export function isDateExpired(date: Date): boolean {
  const today = new Date();

  // Zero out the time part for an accurate date-only comparison
  today.setHours(0, 0, 0, 0);

  return today > date;
}

export function calculateExpirationDateByYear(fromDate: Date): Date {
  const expirationDate = new Date(fromDate);

  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  return expirationDate;
}
