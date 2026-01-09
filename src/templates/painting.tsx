import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
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

/**
 * Extract the best available image URL from Gatsby image data
 */
const getImageUrl = (imageData: IGatsbyImageData | undefined): string => {
  if (!imageData) return ''

  // Try to get the fallback src first (most reliable)
  const fallback = imageData.images?.fallback?.src
  if (fallback) return fallback

  // Try srcSet and get the largest image
  const srcSet = imageData.images?.fallback?.srcSet
  if (srcSet) {
    const sources = srcSet.split(',').map((s) => s.trim())
    const lastSource = sources[sources.length - 1]
    if (lastSource) {
      const url = lastSource.split(' ')[0]
      if (url) return url
    }
  }

  // Fallback to sources array
  const sources = imageData.images?.sources
  if (sources && sources.length > 0) {
    const webpSource = sources.find((s) => s.type === 'image/webp')
    if (webpSource?.srcSet) {
      const srcSetParts = webpSource.srcSet.split(',').map((s) => s.trim())
      const lastPart = srcSetParts[srcSetParts.length - 1]
      if (lastPart) {
        const url = lastPart.split(' ')[0]
        if (url) return url
      }
    }
  }

  return ''
}

const PaintingTemplate: React.FC<
  PageProps<PaintingPageData, PaintingPageContext>
> = ({ data, pageContext }) => {
  const { painting } = pageContext
  const imageData = data.file?.childImageSharp
    ? getImage(data.file.childImageSharp.gatsbyImageData)
    : null
  const zoomImageData = data.zoomFile?.childImageSharp?.gatsbyImageData

  // Get URLs for the magnifier
  const displayUrl = getImageUrl(data.file?.childImageSharp?.gatsbyImageData)
  const zoomUrl = getImageUrl(zoomImageData) || displayUrl

  // Check if we have valid URLs for the magnifier
  const canUseMagnifier = displayUrl && zoomUrl

  return (
    <Layout>
      <article className={styles.paintingDetail}>
        <div className={styles.imageContainer}>
          {canUseMagnifier ? (
            <GlassMagnifier
              src={displayUrl}
              zoomSrc={zoomUrl}
              alt={painting.alt}
              className={styles.magnifierContainer}
              zoomFactor={2.5}
              enableTouch={true}
            />
          ) : imageData ? (
            <GatsbyImage
              image={imageData}
              alt={painting.alt}
              className={styles.image}
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

export const Head: HeadFC<PaintingPageData, PaintingPageContext> = ({
  pageContext,
}) => {
  const { painting } = pageContext
  return (
    <>
      <title>{painting.title} | Lulu Tracy</title>
      <meta name="description" content={painting.description} />
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
          width: 800
          placeholder: BLURRED
          formats: [AUTO, WEBP, AVIF]
          quality: 90
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
