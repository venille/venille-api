const { differenceInCalendarDays } = require('date-fns');
console.log(differenceInCalendarDays(new Date('2026-03-01'), new Date('2026-02-28'))); // expected 1
console.log(differenceInCalendarDays(new Date('2026-03-01'), new Date('2026-03-01'))); // expected 0
console.log(differenceInCalendarDays(new Date('2026-02-28'), new Date('2026-03-01'))); // expected -1
