import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import * as styles from './about.module.css'

interface AboutPageData {
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
  }
  allSiteYaml: {
    nodes: Array<{
      site: {
        name: string
        description: string
        author: string
        email: string
        url: string
      }
    }>
  }
}

const AboutPage: React.FC<PageProps<AboutPageData>> = ({ data }) => {
  const { frontmatter, html } = data.markdownRemark
  const { site } = data.allSiteYaml.nodes[0]
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
            <div className={styles.placeholder}>Photo not available</div>
          )}
        </div>
        <div className={styles.content}>
          <h1 className={styles.artistName}>{frontmatter.artistName}</h1>
          <div
            className={styles.biography}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <a href={`mailto:${site.email}`} className={styles.contactButton}>
            Contact
          </a>
        </div>
      </div>
    </Layout>
  )
}

export default AboutPage

export const Head: HeadFC<AboutPageData> = ({ data }) => {
  const { site } = data.allSiteYaml.nodes[0]
  const { frontmatter, excerpt } = data.markdownRemark
  // Use excerpt from markdown content for description
  const description = `About ${site.author} - ${excerpt}`
  const pageUrl = `${site.url}/about`

  // Get about photo for OG image
  const ogImage = frontmatter.photo?.childImageSharp?.gatsbyImageData?.images
    ?.fallback?.src
    ? `${site.url}${frontmatter.photo.childImageSharp.gatsbyImageData.images.fallback.src}`
    : `${site.url}/icon.png`

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
      <title>{`about | ${site.name}`}</title>
      <meta name="description" content={description} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={`about | ${site.name}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content="en_US" />

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
  query AboutPage {
    allSiteYaml {
      nodes {
        site {
          name
          description
          author
          email
          url
        }
      }
    }
    markdownRemark(frontmatter: { title: { eq: "About" } }) {
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
