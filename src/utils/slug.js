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
function generateSlug(title) {
  return title.toLowerCase().split(' ').join('-')
}

/**
 * Generates the image filename from a title
 * Uses the slug with .jpeg extension
 */
function generateImageFilename(title) {
  return `${generateSlug(title)}.jpeg`
}

module.exports = { generateSlug, generateImageFilename }
