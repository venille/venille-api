export function GenerateSendEmailTimeout(toEmailsLength: number): number {
  if (toEmailsLength <= 10) {
    return 70 * 1000;
  } else if (toEmailsLength <= 50) {
    return 120 * 1000;
  } else if (toEmailsLength <= 100) {
    return 180 * 1000;
  } else if (toEmailsLength <= 200) {
    return 240 * 1000;
  } else {
    return 280 * 1000;
  }
}

export function GenerateProductUrl(
  domain: string,
  productName: string,
  productId: string,
): string {
  const formattedProductName = productName.replace(/,/g, '');

  const formattedProductNameWithoutCommas = formattedProductName
    .replace(/\s+/g, '-')
    .toLowerCase();

  const slug = `${formattedProductNameWithoutCommas}_${productId}`;

  return domain.concat(slug.toLowerCase());
}

export default {
  GenerateProductUrl,
  GenerateSendEmailTimeout,
};
