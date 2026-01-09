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

const SITE_URL = 'https://alexnodeland.github.io/lulutracy.com'

export const Head: HeadFC<IndexPageData> = ({ data }) => {
  const description =
    'Art portfolio of Lulu Tracy - exploring nature through watercolors and acrylics'

  // Get first painting image for OG image
  const paintingsData = data.allPaintingsYaml.nodes[0]
  const paintings = paintingsData?.paintings || []
  const sortedPaintings = [...paintings].sort((a, b) => a.order - b.order)
  const firstPainting = sortedPaintings[0]
  const imageNodes = data.allFile.nodes
  const imageName = firstPainting?.image.replace(/\.[^/.]+$/, '')
  const imageNode = imageNodes.find((node) => node.name === imageName)
  const ogImage = imageNode?.childImageSharp?.gatsbyImageData?.images?.fallback
    ?.src
    ? `${SITE_URL}${imageNode.childImageSharp.gatsbyImageData.images.fallback.src}`
    : `${SITE_URL}/icon.png`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Lulu Tracy Art Portfolio',
    description,
    url: SITE_URL,
  }

  return (
    <>
      <title>lulutracy | art & design</title>
      <meta name="description" content={description} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content="Lulu Tracy | Art Portfolio" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Lulu Tracy" />
      <meta property="og:locale" content="en_US" />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  )
}

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
            width: 450
            aspectRatio: 1
            placeholder: DOMINANT_COLOR
            formats: [AUTO, WEBP, AVIF]
            quality: 85
            breakpoints: [200, 300, 400, 450]
          )
        }
      }
    }
  }
`
