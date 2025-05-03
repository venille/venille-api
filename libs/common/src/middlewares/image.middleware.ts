export const formatPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.startsWith('+234')) {
    return phoneNumber;
  } else if (phoneNumber.startsWith('0')) {
    return '+234'.concat(phoneNumber.substring(1));
  } else {
    return '+234'.concat(phoneNumber);
  }
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
