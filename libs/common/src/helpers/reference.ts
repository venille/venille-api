type TransactionReferenceTypes =
  | 'post_prod'
  | 'premium_subscription'
  | 'promotion';

function makeTransactionReference(source: TransactionReferenceTypes): string {
  const POST_AD_PREFIX = 'LVX_POSTPROD';
  const PREMIUM_PREFIX = 'LVX_PREM';
  const PROMOTION_PREFIX = 'LVX_PROMO';
  const timestamp = getTimeStampID();

  if (source === 'post_prod') {
    return `${POST_AD_PREFIX}-${timestamp}`;
  }

  if (source === 'premium_subscription') {
    return `${PREMIUM_PREFIX}-${timestamp}`;
  }

  if (source === 'promotion') {
    return `${PROMOTION_PREFIX}-${timestamp}`;
  }

  return `${POST_AD_PREFIX}-${timestamp}`; // default fallback
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
    .slice(0, 4);

  return `${yy}${mm}${dd}${randomChars}`;
}

function parseTransactionReferenceType(
  reference: string,
): TransactionReferenceTypes {
  if (reference.includes('LVX_POSTPROD')) {
    return 'post_prod';
  }
  if (reference.includes('LVX_PREM')) {
    return 'premium_subscription';
  }
  if (reference.includes('LVX_PROMO')) {
    return 'promotion';
  }
  return 'post_prod'; // default fallback
}

function getKeyFromTransactionReference(reference: string) {
  return reference.split('-')[1];
}

export const TransactionRefHelpers = {
  makeTransactionReference,
  parseTransactionReferenceType,
  getKeyFromTransactionReference,
  getTimeStampID,
};
