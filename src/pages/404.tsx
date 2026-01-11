import React from 'react'
import { graphql, PageProps, HeadFC } from 'gatsby'
import { Link as I18nLink, useTranslation } from 'gatsby-plugin-react-i18next'
import Layout from '../components/Layout'
import * as styles from './404.module.css'

// Workaround for gatsby-plugin-react-i18next Link type issues
const Link = I18nLink as unknown as React.FC<{
  to: string
  className?: string
  children: React.ReactNode
}>

interface NotFoundPageData {
  allSiteYaml: {
    nodes: Array<{
      site: {
        name: string
      }
      parent: {
        name: string
      }
    }>
  }
}

interface NotFoundPageContext {
  language: string
}

const NotFoundPage: React.FC<
  PageProps<NotFoundPageData, NotFoundPageContext>
> = () => {
  const { t } = useTranslation('404')

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.message}>{t('message')}</p>
        <Link to="/" className={styles.link}>
          {t('returnLink')}
        </Link>
      </div>
    </Layout>
  )
}

export default NotFoundPage

export const Head: HeadFC<NotFoundPageData, NotFoundPageContext> = ({
  data,
  pageContext,
}) => {
  const language = pageContext?.language || 'en'
  const siteNode = data.allSiteYaml.nodes.find(
    (node) => node.parent?.name === 'en'
  )
  const site = siteNode?.site
  return (
    <>
      <html lang={language} />
      <title>{`Page Not Found | ${site?.name || 'lulutracy'}`}</title>
      <meta name="robots" content="noindex, nofollow" />
    </>
  )
}

export const query = graphql`
  query NotFoundPage($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
    allSiteYaml {
      nodes {
        site {
          name
        }
        parent {
          ... on File {
            name
          }
        }
      }
    }
  }
`
