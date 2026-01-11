import React from 'react'
import { graphql, Link, PageProps, HeadFC } from 'gatsby'
import Layout from '../components/Layout'
import * as styles from './404.module.css'

interface NotFoundPageData {
  allSiteYaml: {
    nodes: Array<{
      site: {
        name: string
      }
    }>
  }
}

const NotFoundPage: React.FC<PageProps<NotFoundPageData>> = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link to="/" className={styles.link}>
          Return to Gallery
        </Link>
      </div>
    </Layout>
  )
}

export default NotFoundPage

export const Head: HeadFC<NotFoundPageData> = ({ data }) => {
  const { site } = data.allSiteYaml.nodes[0]
  return (
    <>
      <title>{`Page Not Found | ${site.name}`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </>
  )
}

export const query = graphql`
  query NotFoundPage {
    allSiteYaml {
      nodes {
        site {
          name
        }
      }
    }
  }
`
