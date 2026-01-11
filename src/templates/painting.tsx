import React, { useState } from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import {
  GatsbyImage,
  getImage,
  getSrc,
  IGatsbyImageData,
} from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import Layout from '../components/Layout'
import GlassMagnifier from '../components/GlassMagnifier'
import type { Painting, I18nPageContext, Dimensions } from '../types'
import * as styles from './painting.module.css'

interface PaintingPageContext {
  id: string
  painting: Painting
  imageName: string
  language: string
  i18n: I18nPageContext
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
  siteYaml: {
    site: {
      name: string
      author: string
      url: string
    }
  }
}

const PaintingTemplate: React.FC<
  PageProps<PaintingPageData, PaintingPageContext>
> = ({ data, pageContext }) => {
  const { painting } = pageContext
  const { t } = useTranslation('painting')
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

  // Capitalize first letter helper
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Format dimensions with translated units
  const formatDimensions = (dim: Dimensions | string) => {
    if (typeof dim === 'string') {
      // Legacy string format - return as-is
      return dim
    }
    const unit = t(`units.${dim.unit.toLowerCase()}`)
    return t('dimensionFormat', { width: dim.width, height: dim.height, unit })
  }

  // Get translated term (case-insensitive lookup)
  const getTerm = (key: string, namespace: string) => {
    return t(`${namespace}.${key.toLowerCase()}`)
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
              <span>{t('imageNotAvailable')}</span>
            </div>
          )}
        </div>

        <div className={styles.metadata}>
          <span className={styles.category}>{t('category')}</span>
          <h1 className={styles.title}>{painting.title}</h1>
          <p className={styles.info}>
            {t('artworkSize')}: {formatDimensions(painting.dimensions)} |{' '}
            {capitalize(getTerm(painting.substrate, 'substrates'))} {t('size')}:{' '}
            {formatDimensions(painting.substrateSize)} | {t('medium')}:{' '}
            {capitalize(getTerm(painting.medium, 'mediums'))} {t('on')}{' '}
            {getTerm(painting.substrate, 'substrates')}
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
  data,
}) => {
  const { painting, language } = pageContext
  const currentLang = language || 'en'
  const site = data.siteYaml?.site
  const siteUrl = site?.url || ''

  // Get image URL for OG image
  const imageData = data.file?.childImageSharp?.gatsbyImageData
  const ogImage = imageData?.images?.fallback?.src
    ? `${siteUrl}${imageData.images.fallback.src}`
    : `${siteUrl}/icon.png`

  const siteName = site?.name || 'lulutracy'

  // Define supported languages for hreflang
  const languages = ['en', 'zh', 'yue', 'ms']
  const ogLocaleMap: Record<string, string> = {
    en: 'en_US',
    zh: 'zh_CN',
    yue: 'zh_HK',
    ms: 'ms_MY',
  }
  const ogLocale = ogLocaleMap[currentLang] || 'en_US'
  const basePath = `/painting/${painting.id}`
  const pageUrl =
    currentLang === 'en'
      ? `${siteUrl}${basePath}`
      : `${siteUrl}/${currentLang}${basePath}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: painting.title,
    description: painting.description,
    image: ogImage,
    dateCreated: painting.year,
    artMedium: `${painting.medium.charAt(0).toUpperCase() + painting.medium.slice(1)} on ${painting.substrate}`,
    width:
      typeof painting.dimensions === 'string'
        ? painting.dimensions
        : `${painting.dimensions.width} × ${painting.dimensions.height} ${painting.dimensions.unit}`,
    creator: {
      '@type': 'Person',
      name: site?.author || '',
    },
  }

  return (
    <>
      <html lang={currentLang} />
      <title>{`${painting.title} | ${siteName}`}</title>
      <meta name="description" content={painting.description} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* Hreflang alternate links */}
      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={
            lang === 'en'
              ? `${siteUrl}${basePath}`
              : `${siteUrl}/${lang}${basePath}`
          }
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${siteUrl}${basePath}`}
      />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={`${painting.title} | ${siteName}`} />
      <meta property="og:description" content={painting.description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${painting.title} | ${siteName}`} />
      <meta name="twitter:description" content={painting.description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  )
}

export const query = graphql`
  query PaintingPage($imageName: String!, $language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    siteYaml {
      site {
        name
        author
        url
      }
    }
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
