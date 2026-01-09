/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Lulu Tracy`,
    description: `Art portfolio of Lulu Tracy - exploring nature through watercolors and acrylics`,
    author: `Lulu Tracy`,
    siteUrl: `https://alexnodeland.github.io/lulutracy.com`,
  },
  pathPrefix: `/lulutracy.com`,
  plugins: [
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-yaml`,
    `gatsby-transformer-remark`,
    // Source content files (YAML, Markdown)
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content`,
      },
    },
    // Source painting images
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `paintingImages`,
        path: `${__dirname}/content/paintings/images`,
      },
    },
    // Source site images (logo, about photo, etc.)
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Lulu Tracy Art Portfolio`,
        short_name: `Lulu Tracy`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#000000`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`,
      },
    },
  ],
}
