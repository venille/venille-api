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
