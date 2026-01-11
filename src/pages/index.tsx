import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { IGatsbyImageData } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import GalleryImage from '../components/GalleryImage'
import type { Painting, Dimensions } from '../types'
import { generateSlug, generateImageFilename } from '../utils/slug'
import * as styles from './index.module.css'

// Raw painting data from YAML (without derived fields)
interface RawPainting {
  title: string
  description: string
  dimensions: Dimensions
  substrate: string
  substrateSize: Dimensions
  medium: string
  year: string
  alt: string
  order: number
}

// Locale override - only translatable fields
interface LocaleOverride {
  title: string
  description: string
  alt: string
}

interface IndexPageData {
  paintingsYaml: {
    paintings: RawPainting[]
  }
  allPaintingLocalesYaml: {
    nodes: Array<{
      locale: string
      paintings: LocaleOverride[]
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
  siteYaml: {
    site: {
      name: string
      tagline: string
      description: string
      url: string
    }
  }
  allSiteLocaleYaml: {
    nodes: Array<{
      locale: string
      site: {
        tagline: string
        description: string
      }
    }>
  }
}

interface IndexPageContext {
  language: string
}

const IndexPage: React.FC<PageProps<IndexPageData, IndexPageContext>> = ({
  data,
  pageContext,
}) => {
  const language = pageContext.language || 'en'

  // Get base paintings (English defaults + invariant data)
  const basePaintings = data.paintingsYaml?.paintings || []
  const imageNodes = data.allFile.nodes

  // Build locale override map (keyed by title)
  const localeNode = data.allPaintingLocalesYaml?.nodes?.find(
    (node) => node.locale === language
  )
  const overrideMap = new Map<string, LocaleOverride>()
  localeNode?.paintings?.forEach((p) => {
    overrideMap.set(p.title, p)
  })

  // Merge base paintings with locale overrides and enrich with derived fields
  const paintings: Painting[] = basePaintings.map((base) => {
    const override = overrideMap.get(base.title)
    return {
      ...base,
      description: override?.description || base.description,
      alt: override?.alt || base.alt,
      id: generateSlug(base.title),
      image: generateImageFilename(base.title),
    }
  })

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

export const Head: HeadFC<IndexPageData, IndexPageContext> = ({
  data,
  pageContext,
}) => {
  const language = pageContext?.language || 'en'

  // Get base site data and merge with locale overrides
  const baseSite = data.siteYaml?.site
  const localeOverride = data.allSiteLocaleYaml?.nodes?.find(
    (node) => node.locale === language
  )?.site
  const site = baseSite
    ? {
        ...baseSite,
        tagline: localeOverride?.tagline || baseSite.tagline,
        description: localeOverride?.description || baseSite.description,
      }
    : null
  const siteUrl = site?.url || ''

  // Get first painting image for OG image (from base paintings)
  const basePaintings = data.paintingsYaml?.paintings || []
  const sortedPaintings = [...basePaintings].sort((a, b) => a.order - b.order)
  const firstPainting = sortedPaintings[0]
  const imageNodes = data.allFile.nodes
  const imageName = firstPainting ? generateSlug(firstPainting.title) : ''
  const imageNode = imageNodes.find((node) => node.name === imageName)
  const ogImage = imageNode?.childImageSharp?.gatsbyImageData?.images?.fallback
    ?.src
    ? `${siteUrl}${imageNode.childImageSharp.gatsbyImageData.images.fallback.src}`
    : `${siteUrl}/icon.png`

  // Define supported languages for hreflang
  const languages = ['en', 'zh']
  const ogLocale = language === 'zh' ? 'zh_CN' : 'en_US'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${site?.name} | ${site?.tagline}`,
    description: site?.description,
    url: siteUrl,
  }

  return (
    <>
      <html lang={language} />
      <title>{`${site?.name} | ${site?.tagline}`}</title>
      <meta name="description" content={site?.description || ''} />

      {/* Canonical URL */}
      <link
        rel="canonical"
        href={language === 'en' ? siteUrl : `${siteUrl}/zh/`}
      />

      {/* Hreflang alternate links */}
      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={lang === 'en' ? siteUrl : `${siteUrl}/${lang}/`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={`${site?.name} | ${site?.tagline}`} />
      <meta property="og:description" content={site?.description || ''} />
      <meta
        property="og:url"
        content={language === 'en' ? siteUrl : `${siteUrl}/zh/`}
      />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site?.name || ''} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${site?.name} | ${site?.tagline}`} />
      <meta name="twitter:description" content={site?.description || ''} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  )
}

export const query = graphql`
  query IndexPage($language: String!) {
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
        tagline
        description
        url
      }
    }
    allSiteLocaleYaml {
      nodes {
        locale
        site {
          tagline
          description
        }
      }
    }
    paintingsYaml {
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
    }
    allPaintingLocalesYaml {
      nodes {
        locale
        paintings {
          title
          description
          alt
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
