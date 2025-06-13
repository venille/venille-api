function makeOrderReference(): string {
  const ORDER_PREFIX = 'VNL-ORD';
  const timestamp = getTimeStampID();
  return `${ORDER_PREFIX}-${timestamp}`;
}

function getTimeStampID(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');

  // Generate 4 random characters (letters and numbers)
  const randomChars = Math.random()
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

  return `${yy}${mm}${dd}${randomChars}`;
}

export const ReferenceHelpers = {
  getTimeStampID,
  makeOrderReference,
};
