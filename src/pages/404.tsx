import React from 'react'
import { Link, HeadFC } from 'gatsby'
import Layout from '../components/Layout'
import * as styles from './404.module.css'

const NotFoundPage: React.FC = () => {
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

export const Head: HeadFC = () => (
  <>
    <title>Page Not Found | Lulu Tracy</title>
  </>
)
