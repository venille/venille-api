import * as bcrypt from 'bcrypt';

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, parseInt(process.env.AUTH_SALT_ROUNDS));
};

const comparePassword = (password: string, hash: string) =>
  bcrypt.compareSync(password, hash);

const getOriginHeader = ({ headers: { origin } }: any): string => {
  if (origin) {
    return typeof origin === 'string' ? origin : origin[0];
  }
  return 'https://medexer.com.ng';
};

function generateRandomPin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function isDatePastThreeMonths(date: string): boolean {
  const currentDate = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(currentDate.getMonth() - 3); 

  return new Date(date) <= threeMonthsAgo;
}

function generateFutureDate(
  length: number,
  unit: 'days' | 'hours' | 'minutes' | 'seconds',
): Date {
  const now = new Date();

  const unitsInMilliseconds = {
    days: 24 * 60 * 60 * 1000, // 1 day = 24 hours
    hours: 60 * 60 * 1000, // 1 hour = 60 minutes
    minutes: 60 * 1000, // 1 minute = 60 seconds
    seconds: 1000, // 1 second = 1000 milliseconds
  };

  if (!unitsInMilliseconds[unit]) {
    throw new Error(
      `Invalid unit: ${unit}. Use 'days', 'hours', 'minutes', or 'seconds'.`,
    );
  }

  const futureDate = new Date(
    now.getTime() + length * unitsInMilliseconds[unit],
  );
  return futureDate;
}

export default {
  comparePassword,
  hashPassword,
  getOriginHeader,
  generateRandomPin,
  generateFutureDate,
  isDatePastThreeMonths,
};
