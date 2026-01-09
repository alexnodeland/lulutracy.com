import path from 'path'
import type { GatsbyNode } from 'gatsby'
import { generateSlug, generateImageFilename } from './src/utils/slug'

interface RawPainting {
  title: string
  description: string
  dimensions: string
  substrate: string
  substrateSize: string
  medium: string
  year: string
  alt: string
  order: number
}

interface PaintingsQueryResult {
  allPaintingsYaml: {
    nodes: Array<{
      paintings: RawPainting[]
    }>
  }
}

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions
  const paintingTemplate = path.resolve('./src/templates/painting.tsx')

  // Query all paintings from YAML
  const result = await graphql<PaintingsQueryResult>(`
    query {
      allPaintingsYaml {
        nodes {
          paintings {
            title
            description
            dimensions
            substrate
            substrateSize
            medium
            year
            alt
            order
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
    return
  }

  // Get paintings array from YAML data
  const paintingsData = result.data?.allPaintingsYaml.nodes[0]
  if (paintingsData && paintingsData.paintings) {
    paintingsData.paintings.forEach((painting) => {
      // Derive id and image filename from title
      const id = generateSlug(painting.title)
      const image = generateImageFilename(painting.title)
      const imageName = image.replace(/\.[^/.]+$/, '')

      // Create enriched painting object with derived fields
      const enrichedPainting = {
        ...painting,
        id,
        image,
      }

      createPage({
        path: `/painting/${id}`,
        component: paintingTemplate,
        context: {
          id: id,
          painting: enrichedPainting,
          imageName: imageName,
        },
      })
    })
  }
}
