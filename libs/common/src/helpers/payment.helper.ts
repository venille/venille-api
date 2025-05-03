export function getDateTimeStamp(
  startTime: string,
  endTime: string,
): { startTimestamp: string; endTimestamp: string } {
  const today = new Date();

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startDateTime = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      startHours,
      startMinutes,
    ),
  );
  const endDateTime = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      endHours,
      endMinutes,
    ),
  );

  return {
    startTimestamp: startDateTime.toISOString(),
    endTimestamp: endDateTime.toISOString(),
  };
}

export function getPreviousDateTimeStamp(
  startTime: string,
  endTime: string,
): { startTimestamp: string; endTimestamp: string } {
  const today = new Date();

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  // Calculate start timestamp from the previous day
  const startDateTime = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
      startHours,
      startMinutes,
    ),
  );

  // Calculate end timestamp from the current day
  const endDateTime = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      endHours,
      endMinutes,
    ),
  );

  return {
    startTimestamp: startDateTime.toISOString(),
    endTimestamp: endDateTime.toISOString(),
  };
}

export function hasNonLiveDomain(transactions: any[]): boolean {
  return transactions.some((transaction) => transaction?.domain !== 'live');
}

export function getAbandonedOrFailedTransactions(transactions: any) {
  // Group transactions by customer email
  const customerTransactions = transactions.reduce((acc, transaction) => {
    const email = transaction.customer.email;
    if (!acc[email]) {
      acc[email] = [];
    }
    acc[email].push(transaction);
    return acc;
  }, {});

  // Filter unique transactions
  const result = [];
  for (const email in customerTransactions) {
    const userTransactions = customerTransactions[email];
    const hasSuccess = userTransactions.some((t) => t.status === 'success');

    if (!hasSuccess) {
      const abandonedOrFailed = userTransactions.find(
        (t) => t.status === 'abandoned' || t.status === 'failed',
      );
      if (abandonedOrFailed) {
        result.push(abandonedOrFailed);
      }
    }
  }

  return result;
}
