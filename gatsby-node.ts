import path from 'path'
import fs from 'fs'
import type { GatsbyNode } from 'gatsby'
import yaml from 'js-yaml'
import glob from 'glob'
import { generateSlug, generateImageFilename } from './src/utils/slug'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const piexif = require('piexifjs')

const LANGUAGES = ['en', 'zh'] as const
const DEFAULT_LANGUAGE = 'en'

type Language = (typeof LANGUAGES)[number]

interface SiteConfig {
  name: string
  author: string
}

interface Dimensions {
  width: number
  height: number
  unit: string
}

interface RawPainting {
  title: string
  description: string
  dimensions: Dimensions | string
  substrate: string
  substrateSize: Dimensions | string
  medium: string
  year: string
  alt: string
  order: number
}

interface PaintingsQueryResult {
  allPaintingsYaml: {
    nodes: Array<{
      paintings: RawPainting[]
      parent: {
        name: string
      }
    }>
  }
}

interface I18nContext {
  language: Language
  languages: readonly string[]
  defaultLanguage: Language
  originalPath: string
  routed: boolean
}

/**
 * Explicitly define GraphQL schema for paintings with structured dimensions
 */
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  ({ actions }) => {
    const { createTypes } = actions
    const typeDefs = `
      type PaintingsYamlPaintingsDimensions {
        width: Float!
        height: Float!
        unit: String!
      }

      type PaintingsYamlPaintingsSubstrateSize {
        width: Float!
        height: Float!
        unit: String!
      }

      type PaintingsYamlPaintings {
        title: String!
        description: String!
        dimensions: PaintingsYamlPaintingsDimensions!
        substrate: String!
        substrateSize: PaintingsYamlPaintingsSubstrateSize!
        medium: String!
        year: String!
        alt: String!
        order: Int!
      }
    `
    createTypes(typeDefs)
  }

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions
  const paintingTemplate = path.resolve('./src/templates/painting.tsx')

  // Query all paintings from locale-specific YAML files
  const result = await graphql<PaintingsQueryResult>(`
    query {
      allPaintingsYaml {
        nodes {
          paintings {
            title
            description
            dimensions {
              width
              height
              unit
            }
            substrate
            substrateSize {
              width
              height
              unit
            }
            medium
            year
            alt
            order
          }
          parent {
            ... on File {
              name
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
    return
  }

  // Group paintings by locale
  const paintingsByLocale = new Map<Language, RawPainting[]>()

  result.data?.allPaintingsYaml.nodes.forEach((node) => {
    const locale = node.parent?.name as Language
    if (LANGUAGES.includes(locale)) {
      paintingsByLocale.set(locale, node.paintings)
    }
  })

  // Get English paintings for consistent slug generation
  const enPaintings = paintingsByLocale.get('en') || []

  // Create pages for each language
  LANGUAGES.forEach((lang) => {
    const paintings = paintingsByLocale.get(lang) || []

    paintings.forEach((painting, index) => {
      // Use English painting for slug generation (for URL consistency)
      const enPainting = enPaintings[index]
      const slugSource = enPainting || painting
      const id = generateSlug(slugSource.title)
      const image = generateImageFilename(slugSource.title)
      const imageName = image.replace(/\.[^/.]+$/, '')

      const originalPath = `/painting/${id}`
      const pagePath =
        lang === DEFAULT_LANGUAGE ? originalPath : `/${lang}${originalPath}`

      // Create enriched painting object with derived fields
      const enrichedPainting = {
        ...painting,
        id,
        image,
      }

      const i18n: I18nContext = {
        language: lang,
        languages: LANGUAGES,
        defaultLanguage: DEFAULT_LANGUAGE,
        originalPath,
        routed: lang !== DEFAULT_LANGUAGE,
      }

      createPage({
        path: pagePath,
        component: paintingTemplate,
        context: {
          id,
          painting: enrichedPainting,
          imageName,
          language: lang,
          i18n,
        },
      })
    })
  })
}

/**
 * Format dimensions for display
 */
function formatDimensions(dim: Dimensions | string): string {
  if (typeof dim === 'string') {
    return dim
  }
  return `${dim.width} × ${dim.height} ${dim.unit}`
}

/**
 * Format painting metadata for EXIF UserComment field
 */
function formatUserComment(painting: RawPainting): string {
  return [
    painting.description,
    `Medium: ${painting.medium} on ${painting.substrate}`,
    `Size: ${formatDimensions(painting.dimensions)}`,
    `Substrate: ${formatDimensions(painting.substrateSize)}`,
    `Year: ${painting.year}`,
  ].join(' | ')
}

/**
 * Inject EXIF metadata into a JPEG file
 */
function injectMetadata(
  imagePath: string,
  painting: RawPainting,
  site: SiteConfig
): void {
  const buffer = fs.readFileSync(imagePath)
  const binary = buffer.toString('binary')

  const currentYear = new Date().getFullYear()

  const exifObj = {
    '0th': {
      [piexif.ImageIFD.Artist]: site.author,
      [piexif.ImageIFD.Copyright]:
        `© ${currentYear} ${site.name}. All rights reserved.`,
      [piexif.ImageIFD.ImageDescription]: painting.title,
      [piexif.ImageIFD.Software]: site.name,
    },
    Exif: {
      [piexif.ExifIFD.UserComment]: formatUserComment(painting),
      [piexif.ExifIFD.DateTimeOriginal]: `${painting.year}:01:01 00:00:00`,
    },
  }

  const exifBytes = piexif.dump(exifObj)
  const newData = piexif.insert(exifBytes, binary)

  fs.writeFileSync(imagePath, Buffer.from(newData, 'binary'))
}

/**
 * Post-build hook to inject EXIF metadata into processed JPEG images
 */
export const onPostBuild: GatsbyNode['onPostBuild'] = async ({ reporter }) => {
  const activity = reporter.activityTimer('Injecting metadata into images')
  activity.start()

  try {
    // Load site config (use English for EXIF metadata)
    const siteYamlPath = path.join(__dirname, 'content/site/en.yaml')
    const siteYamlContent = fs.readFileSync(siteYamlPath, 'utf8')
    const siteYaml = yaml.load(siteYamlContent) as { site: SiteConfig }
    const site = siteYaml.site

    // Load English paintings metadata for EXIF
    const paintingsYamlPath = path.join(__dirname, 'content/paintings/en.yaml')
    const paintingsYamlContent = fs.readFileSync(paintingsYamlPath, 'utf8')
    const paintingsYaml = yaml.load(paintingsYamlContent) as {
      paintings: RawPainting[]
    }
    const paintings = paintingsYaml.paintings

    // Create painting lookup by slug
    const paintingMap = new Map<string, RawPainting>()
    for (const painting of paintings) {
      const slug = generateSlug(painting.title)
      paintingMap.set(slug, painting)
    }

    // Find all JPEGs in public/static
    const publicPath = path.join(__dirname, 'public', 'static')
    const jpegFiles = glob.sync(`${publicPath}/**/*.jpg`)

    // Inject metadata into each JPEG
    let processed = 0
    let skipped = 0

    for (const jpegPath of jpegFiles) {
      const filename = path.basename(jpegPath, '.jpg')
      const painting = paintingMap.get(filename)

      if (painting) {
        try {
          injectMetadata(jpegPath, painting, site)
          processed++
        } catch (err) {
          reporter.warn(`Failed to inject metadata into ${jpegPath}: ${err}`)
          skipped++
        }
      }
    }

    activity.end()
    reporter.info(
      `Injected metadata into ${processed} images (${skipped} skipped)`
    )
  } catch (err) {
    activity.end()
    reporter.warn(`Failed to inject image metadata: ${err}`)
  }
}
