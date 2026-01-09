import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
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
}

const PaintingTemplate: React.FC<
  PageProps<PaintingPageData, PaintingPageContext>
> = ({ data, pageContext }) => {
  const { painting } = pageContext
  const imageData = data.file?.childImageSharp
    ? getImage(data.file.childImageSharp.gatsbyImageData)
    : null

  return (
    <Layout>
      <article className={styles.paintingDetail}>
        <div className={styles.imageContainer}>
          {imageData ? (
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
          width: 1200
          placeholder: BLURRED
          formats: [AUTO, WEBP, AVIF]
          quality: 95
        )
      }
    }
  }
`
