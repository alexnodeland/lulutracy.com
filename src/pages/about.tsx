import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import Layout from '../components/Layout'
import * as styles from './about.module.css'

interface AboutPageData {
  markdownRemark: {
    frontmatter: {
      title: string
      artistName: string
      photo: string
    }
    html: string
  }
}

const AboutPage: React.FC<PageProps<AboutPageData>> = ({ data }) => {
  const { frontmatter, html } = data.markdownRemark

  return (
    <Layout>
      <div className={styles.about}>
        <div className={styles.photoContainer}>
          <StaticImage
            src="../images/about.jpeg"
            alt="Lulu Tracy"
            className={styles.photo}
            placeholder="blurred"
            layout="constrained"
            width={500}
          />
        </div>
        <div className={styles.content}>
          <h1 className={styles.artistName}>{frontmatter.artistName}</h1>
          <div
            className={styles.biography}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <a
            href="mailto:contact@lulutracy.com"
            className={styles.contactButton}
          >
            Contact
          </a>
        </div>
      </div>
    </Layout>
  )
}

export default AboutPage

const SITE_URL = 'https://alexnodeland.github.io/lulutracy.com'

export const Head: HeadFC = () => {
  const description =
    'Learn about Lulu Tracy - an artist exploring nature through watercolors and acrylics'

  return (
    <>
      <title>about | lulutracy</title>
      <meta name="description" content={description} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content="About | Lulu Tracy" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_URL}/about`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Lulu Tracy" />
      <meta property="og:locale" content="en_US" />
    </>
  )
}

export const query = graphql`
  query AboutPage {
    markdownRemark(frontmatter: { title: { eq: "About" } }) {
      frontmatter {
        title
        artistName
        photo
      }
      html
    }
  }
`
