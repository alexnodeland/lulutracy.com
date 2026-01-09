import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { IGatsbyImageData } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import GalleryImage from '../components/GalleryImage'
import type { Painting } from '../types'
import * as styles from './index.module.css'

interface IndexPageData {
  allPaintingsYaml: {
    nodes: Array<{
      paintings: Painting[]
    }>
  }
  allFile: {
    nodes: Array<{
      name: string
      childImageSharp: {
        gatsbyImageData: IGatsbyImageData
      }
    }>
  }
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const paintingsData = data.allPaintingsYaml.nodes[0]
  const paintings = paintingsData?.paintings || []
  const imageNodes = data.allFile.nodes

  // Sort paintings by order
  const sortedPaintings = [...paintings].sort((a, b) => a.order - b.order)

  // Create a map of image name to image data
  const imageMap = new Map<string, IGatsbyImageData>()
  imageNodes.forEach((node) => {
    if (node.childImageSharp) {
      imageMap.set(node.name, node.childImageSharp.gatsbyImageData)
    }
  })

  return (
    <Layout>
      <div className={styles.gallery}>
        {sortedPaintings.map((painting) => {
          // Extract filename without extension
          const imageName = painting.image.replace(/\.[^/.]+$/, '')
          const imageData = imageMap.get(imageName) || null

          return (
            <GalleryImage
              key={painting.id}
              painting={painting}
              image={imageData}
            />
          )
        })}
      </div>
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <title>Lulu Tracy | Art Portfolio</title>
    <meta
      name="description"
      content="Art portfolio of Lulu Tracy - exploring nature through watercolors and acrylics"
    />
  </>
)

export const query = graphql`
  query IndexPage {
    allPaintingsYaml {
      nodes {
        paintings {
          id
          title
          description
          dimensions
          canvasSize
          medium
          year
          image
          alt
          order
        }
      }
    }
    allFile(filter: { sourceInstanceName: { eq: "paintingImages" } }) {
      nodes {
        name
        childImageSharp {
          gatsbyImageData(
            width: 400
            placeholder: DOMINANT_COLOR
            formats: [AUTO, WEBP, AVIF]
            quality: 85
          )
        }
      }
    }
  }
`
