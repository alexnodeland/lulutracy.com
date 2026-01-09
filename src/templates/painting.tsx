import React, { useState } from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import {
  GatsbyImage,
  getImage,
  getSrc,
  IGatsbyImageData,
} from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import GlassMagnifier from '../components/GlassMagnifier'
import type { Painting } from '../types'
import * as styles from './painting.module.css'

interface PaintingPageContext {
  id: string
  painting: Painting
  imageName: string
}

interface PaintingPageData {
  file: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData
    }
  } | null
  zoomFile: {
    childImageSharp: {
      gatsbyImageData: IGatsbyImageData
    }
  } | null
}

const PaintingTemplate: React.FC<
  PageProps<PaintingPageData, PaintingPageContext>
> = ({ data, pageContext }) => {
  const { painting } = pageContext
  const [magnifierError, setMagnifierError] = useState(false)

  const imageData = data.file?.childImageSharp
    ? getImage(data.file.childImageSharp.gatsbyImageData)
    : null
  const zoomImageData = data.zoomFile?.childImageSharp?.gatsbyImageData

  // Get URLs for the magnifier using Gatsby's official getSrc helper
  const displayImageData = data.file?.childImageSharp?.gatsbyImageData
  const displayUrl = displayImageData ? getSrc(displayImageData) : undefined
  const zoomUrl = zoomImageData ? getSrc(zoomImageData) : displayUrl

  // Detect image orientation from gatsbyImageData
  const imgWidth = displayImageData?.width || 0
  const imgHeight = displayImageData?.height || 0
  const isPortrait = imgHeight > imgWidth

  // Check if we have valid URLs for the magnifier (and no previous error)
  const canUseMagnifier = displayUrl && zoomUrl && !magnifierError

  const handleMagnifierError = () => {
    setMagnifierError(true)
  }

  return (
    <Layout>
      <article className={styles.paintingDetail}>
        <div className={styles.imageContainer}>
          {canUseMagnifier ? (
            <GlassMagnifier
              src={displayUrl}
              zoomSrc={zoomUrl}
              alt={painting.alt}
              className={`${styles.magnifierContainer} ${isPortrait ? styles.portrait : styles.landscape}`}
              zoomFactor={2.5}
              enableTouch={true}
              onError={handleMagnifierError}
            />
          ) : imageData ? (
            <GatsbyImage
              image={imageData}
              alt={painting.alt}
              className={`${styles.image} ${isPortrait ? styles.portrait : styles.landscape}`}
            />
          ) : (
            <div className={styles.placeholder}>
              <span>Image not available</span>
            </div>
          )}
        </div>

        <div className={styles.metadata}>
          <span className={styles.category}>PAINTING</span>
          <h1 className={styles.title}>{painting.title}</h1>
          <p className={styles.info}>
            Size: {painting.dimensions} | Canvas Size: {painting.canvasSize} |{' '}
            Medium: {painting.medium}
          </p>
          <p className={styles.year}>{painting.year}</p>
        </div>
      </article>
    </Layout>
  )
}

export default PaintingTemplate

const SITE_URL = 'https://alexnodeland.github.io/lulutracy.com'

export const Head: HeadFC<PaintingPageData, PaintingPageContext> = ({
  pageContext,
  data,
}) => {
  const { painting } = pageContext

  // Get image URL for OG image
  const imageData = data.file?.childImageSharp?.gatsbyImageData
  const ogImage = imageData?.images?.fallback?.src
    ? `${SITE_URL}${imageData.images.fallback.src}`
    : `${SITE_URL}/icon.png`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: painting.title,
    description: painting.description,
    image: ogImage,
    dateCreated: painting.year,
    artMedium: painting.medium,
    width: painting.dimensions,
    creator: {
      '@type': 'Person',
      name: 'Lulu Tracy',
    },
  }

  return (
    <>
      <title>{painting.title} | Lulu Tracy</title>
      <meta name="description" content={painting.description} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={`${painting.title} | Lulu Tracy`} />
      <meta property="og:description" content={painting.description} />
      <meta property="og:url" content={`${SITE_URL}/painting/${painting.id}`} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Lulu Tracy" />
      <meta property="og:locale" content="en_US" />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  )
}

export const query = graphql`
  query PaintingPage($imageName: String!) {
    file(
      sourceInstanceName: { eq: "paintingImages" }
      name: { eq: $imageName }
    ) {
      childImageSharp {
        gatsbyImageData(
          width: 1200
          placeholder: DOMINANT_COLOR
          formats: [AUTO, WEBP, AVIF]
          quality: 85
        )
      }
    }
    zoomFile: file(
      sourceInstanceName: { eq: "paintingImages" }
      name: { eq: $imageName }
    ) {
      childImageSharp {
        gatsbyImageData(
          width: 2400
          placeholder: NONE
          formats: [AUTO, WEBP]
          quality: 95
        )
      }
    }
  }
`
