import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { IGatsbyImageData } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import GalleryImage from '../components/GalleryImage'
import type { Painting } from '../types'
import { generateSlug, generateImageFilename } from '../utils/slug'
import * as styles from './index.module.css'

// Raw painting data from YAML (without derived fields)
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

interface IndexPageData {
  allPaintingsYaml: {
    nodes: Array<{
      paintings: RawPainting[]
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
  allSiteYaml: {
    nodes: Array<{
      site: {
        name: string
        tagline: string
        description: string
        url: string
      }
    }>
  }
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const paintingsData = data.allPaintingsYaml.nodes[0]
  const rawPaintings = paintingsData?.paintings || []
  const imageNodes = data.allFile.nodes

  // Enrich paintings with derived id and image fields
  const paintings: Painting[] = rawPaintings.map((raw) => ({
    ...raw,
    id: generateSlug(raw.title),
    image: generateImageFilename(raw.title),
  }))

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

export const Head: HeadFC<IndexPageData> = ({ data }) => {
  const { site } = data.allSiteYaml.nodes[0]
  const siteUrl = site.url

  // Get first painting image for OG image
  const paintingsData = data.allPaintingsYaml.nodes[0]
  const rawPaintings = paintingsData?.paintings || []
  const sortedPaintings = [...rawPaintings].sort((a, b) => a.order - b.order)
  const firstPainting = sortedPaintings[0]
  const imageNodes = data.allFile.nodes
  const imageName = firstPainting ? generateSlug(firstPainting.title) : ''
  const imageNode = imageNodes.find((node) => node.name === imageName)
  const ogImage = imageNode?.childImageSharp?.gatsbyImageData?.images?.fallback
    ?.src
    ? `${siteUrl}${imageNode.childImageSharp.gatsbyImageData.images.fallback.src}`
    : `${siteUrl}/icon.png`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${site.name} | ${site.tagline}`,
    description: site.description,
    url: siteUrl,
  }

  return (
    <>
      <title>{`${site.name} | ${site.tagline}`}</title>
      <meta name="description" content={site.description} />

      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={`${site.name} | ${site.tagline}`} />
      <meta property="og:description" content={site.description} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${site.name} | ${site.tagline}`} />
      <meta name="twitter:description" content={site.description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  )
}

export const query = graphql`
  query IndexPage {
    allSiteYaml {
      nodes {
        site {
          name
          tagline
          description
          url
        }
      }
    }
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
