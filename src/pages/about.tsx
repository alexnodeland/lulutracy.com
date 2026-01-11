import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import { useTranslation } from 'gatsby-plugin-react-i18next'
import Layout from '../components/Layout'
import * as styles from './about.module.css'

interface AboutPageData {
  locales: {
    edges: Array<{
      node: {
        ns: string
        data: string
        language: string
      }
    }>
  }
  markdownRemark: {
    frontmatter: {
      title: string
      artistName: string
      photo: {
        childImageSharp: {
          gatsbyImageData: IGatsbyImageData
        }
      } | null
    }
    html: string
    excerpt: string
  } | null
  siteYaml: {
    site: {
      name: string
      author: string
      email: string
      url: string
    }
  }
}

// Helper to get translation from locale data
function getTranslation(
  locales: AboutPageData['locales'],
  ns: string,
  key: string
): string | undefined {
  const localeNode = locales?.edges?.find((edge) => edge.node.ns === ns)
  if (!localeNode) return undefined
  try {
    const data = JSON.parse(localeNode.node.data)
    return key.split('.').reduce((obj, k) => obj?.[k], data)
  } catch {
    return undefined
  }
}

interface AboutPageContext {
  language: string
}

const AboutPage: React.FC<PageProps<AboutPageData, AboutPageContext>> = ({
  data,
}) => {
  const { t } = useTranslation('about')
  const markdownRemark = data.markdownRemark
  const site = data.siteYaml?.site

  if (!markdownRemark) {
    return (
      <Layout>
        <div className={styles.about}>
          <p>Content not available</p>
        </div>
      </Layout>
    )
  }

  const { frontmatter, html } = markdownRemark
  const image = frontmatter.photo?.childImageSharp
    ? getImage(frontmatter.photo.childImageSharp.gatsbyImageData)
    : null

  return (
    <Layout>
      <div className={styles.about}>
        <div className={styles.photoContainer}>
          {image ? (
            <GatsbyImage
              image={image}
              alt={site.author}
              className={styles.photo}
            />
          ) : (
            <div className={styles.placeholder}>{t('photoNotAvailable')}</div>
          )}
        </div>
        <div className={styles.content}>
          <h1 className={styles.artistName}>{frontmatter.artistName}</h1>
          <div
            className={styles.biography}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <a href={`mailto:${site.email}`} className={styles.contactButton}>
            {t('contact')}
          </a>
        </div>
      </div>
    </Layout>
  )
}

export default AboutPage

export const Head: HeadFC<AboutPageData, AboutPageContext> = ({
  data,
  pageContext,
}) => {
  const language = pageContext?.language || 'en'

  // Get site data from YAML (invariant) and translations from locales
  const baseSite = data.siteYaml?.site
  const siteDescription =
    getTranslation(data.locales, 'common', 'site.description') ||
    'Art portfolio of lulutracy'
  const site = baseSite
    ? {
        ...baseSite,
        description: siteDescription,
      }
    : null
  const markdownRemark = data.markdownRemark

  if (!markdownRemark || !site) {
    return <title>About | {site?.name || 'lulutracy'}</title>
  }

  const { frontmatter, excerpt } = markdownRemark
  // Use excerpt from markdown content for description
  const description = `About ${site.author} - ${excerpt}`
  const pageUrl =
    language === 'en' ? `${site.url}/about` : `${site.url}/${language}/about`

  // Get about photo for OG image
  const ogImage = frontmatter.photo?.childImageSharp?.gatsbyImageData?.images
    ?.fallback?.src
    ? `${site.url}${frontmatter.photo.childImageSharp.gatsbyImageData.images.fallback.src}`
    : `${site.url}/icon.png`

  // Define supported languages for hreflang
  const languages = ['en', 'zh', 'yue', 'ms']
  const ogLocaleMap: Record<string, string> = {
    en: 'en_US',
    zh: 'zh_CN',
    yue: 'zh_HK',
    ms: 'ms_MY',
  }
  const ogLocale = ogLocaleMap[language] || 'en_US'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About | ${site.name}`,
    description,
    url: pageUrl,
    mainEntity: {
      '@type': 'Person',
      name: site.author,
      description: site.description,
      url: site.url,
    },
  }

  return (
    <>
      <html lang={language} />
      <title>{`about | ${site.name}`}</title>
      <meta name="description" content={description} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* Hreflang alternate links */}
      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={
            lang === 'en' ? `${site.url}/about` : `${site.url}/${lang}/about`
          }
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${site.url}/about`} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={`about | ${site.name}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content={ogLocale} />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`about | ${site.name}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  )
}

export const query = graphql`
  query AboutPage($language: String!) {
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
        email
        url
      }
    }
    markdownRemark(
      frontmatter: { locale: { eq: $language } }
      fileAbsolutePath: { regex: "/content/about/" }
    ) {
      frontmatter {
        title
        artistName
        photo {
          childImageSharp {
            gatsbyImageData(
              width: 500
              placeholder: BLURRED
              formats: [AUTO, WEBP, AVIF]
              quality: 85
            )
          }
        }
      }
      html
      excerpt(pruneLength: 160)
    }
  }
`
