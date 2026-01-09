const path = require('path')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const paintingTemplate = path.resolve('./src/templates/painting.tsx')

  // Query all paintings from YAML
  const result = await graphql(`
    query {
      allPaintingsYaml {
        nodes {
          paintings {
            id
            title
            description
            dimensions
            substrate
            substrateSize
            medium
            year
            image
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
  const paintingsData = result.data.allPaintingsYaml.nodes[0]
  if (paintingsData && paintingsData.paintings) {
    paintingsData.paintings.forEach((painting) => {
      // Extract filename without extension for GraphQL query
      const imageName = painting.image.replace(/\.[^/.]+$/, '')

      createPage({
        path: `/painting/${painting.id}`,
        component: paintingTemplate,
        context: {
          id: painting.id,
          painting: painting,
          imageName: imageName,
        },
      })
    })
  }
}
