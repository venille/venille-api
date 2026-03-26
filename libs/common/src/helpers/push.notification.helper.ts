export function getPushNotificationTemplate(
  templates: { title: string; body: string; imageUrl?: string }[],
): {
  title: string;
  body: string;
  imageUrl?: string;
} {
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Monday to Friday: Select a template based on the day of the week
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return templates[dayOfWeek - 1]; // Use the template corresponding to the day (index 0 is Monday)
  }

  // Saturday or Sunday: Randomly select a template
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

export function getTemplateByDay(
  templates: { title: string; body: string; imageUrl?: string }[],
): {
  title: string;
  body: string;
  imageUrl?: string;
} {
  if (templates.length === 0) {
    return { title: '', body: '' }; // Fallback for empty templates
  }

  const date = new Date();
  const day = date.getDate(); // 1 - 31

  // If the template length is greater than 7 and it's the 7th day of the month, alternate between 7th and 8th template
  if (templates.length > 7 && day === 7) {
    const month = date.getMonth();
    // Alternate between the 7th (index 6) and 8th (index 7) template based on the month (even/odd)
    return month % 2 === 0 ? templates[6] : templates[7];
  }

  // Otherwise, select template based on the day (1-indexed day maps to 0-indexed templates)
  return templates[(day - 1) % templates.length];
}

/**
 * Selects a random template from the list.
 * @param templates List of notification templates
 */
export function getRandomTemplate(
  templates: { title: string; body: string; imageUrl?: string }[],
): {
  title: string;
  body: string;
  imageUrl?: string;
} {
  if (templates.length === 0) {
    return { title: '', body: '' }; // Fallback for empty templates
  }

  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

/**
 * Selects a template from the list in a rotational manner to ensure all are picked
 * and no template is repeated within a week (if list length > 7).
 * To provide variety while staying deterministic, it uses a month-based offset.
 * @param templates List of notification templates
 */
export function getRotationTemplate(
  templates: { title: string; body: string; imageUrl?: string }[],
): {
  title: string;
  body: string;
  imageUrl?: string;
} {
  if (templates.length === 0) {
    return { title: '', body: '' }; // Fallback for empty templates
  }

  const date = new Date();
  const dayOfMonth = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // Create a deterministic offset based on month and year to vary the order monthly
  const offset = (month + year) % templates.length;

  // Rotate through templates based on the day of the month
  // This ensures all templates are picked and no repeats within 7 days if length > 7
  const index = (dayOfMonth - 1 + offset) % templates.length;

  return templates[index];
}
