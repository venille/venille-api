export function generateRandomChatMessageId(): string {
  let min = 5000;
  let max = 10000;

  min = Math.ceil(min);
  max = Math.floor(max);

  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

export function ReferralCodeGenerator(): string {
  const length = 8;
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let referralCode = '';
  const charsetLength = charSet.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    referralCode += charSet[randomIndex];
  }

  return 'VNL-' + referralCode.toUpperCase();
}

export function VendorIdGenerator(): string {
  let result = 'VNL-';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function ProductIdGenerator(): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function GenerateUniqueTrackingNumber(): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(2, 4);
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(currentDate.getDate()).padStart(2, '0');
  // Generate a random alphanumeric string of 4 characters
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  // Combine year, month, day with the random part for a unique identifier
  return `${year}${month}${day}${randomPart}`;
}
