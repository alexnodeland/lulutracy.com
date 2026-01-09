/**
 * Generates a URL-friendly slug from a title
 * - Converts to lowercase
 * - Replaces spaces with dashes
 *
 * Examples:
 * - "Symbiosis" → "symbiosis"
 * - "Night Hours" → "night-hours"
 * - "Nature Study I" → "nature-study-i"
 * - "Nature Study III" → "nature-study-iii"
 */
export function generateSlug(title: string): string {
  return title.toLowerCase().split(' ').join('-')
}

/**
 * Generates the image filename from a title
 * Uses the slug with .jpeg extension
 */
export function generateImageFilename(title: string): string {
  return `${generateSlug(title)}.jpeg`
}
