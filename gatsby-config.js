/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `lulutracy`,
    description: `Art portfolio of lulutracy - exploring nature through watercolors and acrylics`,
    author: `lulutracy`,
    siteUrl: `https://our-nature.github.io/lulutracy.com`,
    supportedLanguages: ['en', 'zh', 'yue'],
    defaultLanguage: 'en',
  },
  pathPrefix: process.env.PREFIX_PATHS === 'true' ? `/lulutracy.com` : ``,
  plugins: [
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        resolveSiteUrl: () => `https://our-nature.github.io/lulutracy.com`,
        serialize: ({ path }) => ({
          url: `https://our-nature.github.io/lulutracy.com${path}`,
          changefreq: `weekly`,
          priority: path === `/` ? 1.0 : 0.7,
        }),
      },
    },
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: [`auto`, `webp`, `avif`],
          placeholder: `blurred`,
          quality: 75,
        },
        stripMetadata: false, // Preserve ICC color profiles for art
        defaultQuality: 75,
        failOn: `warning`, // Ensure image quality
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-transformer-yaml`,
    `gatsby-transformer-remark`,
    // Source content files (YAML, Markdown)
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/content`,
        ignore: [
          `**/paintings/images/**`,
          `**/paintings/locales/**`,
          `**/site/locales/**`,
        ],
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
    // Source painting locale overrides (for i18n translations)
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `paintingLocales`,
        path: `${__dirname}/content/paintings/locales`,
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
        name: `lulutracy Art Portfolio`,
        short_name: `lulutracy`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#000000`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`,
      },
    },
    // Source locale files for i18n
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `locale`,
        path: `${__dirname}/locales`,
      },
    },
    // i18n plugin
    {
      resolve: `gatsby-plugin-react-i18next`,
      options: {
        localeJsonSourceName: `locale`,
        languages: ['en', 'zh', 'yue'],
        defaultLanguage: 'en',
        generateDefaultLanguagePages: true,
        siteUrl: `https://our-nature.github.io/lulutracy.com`,
        i18nextOptions: {
          interpolation: {
            escapeValue: false,
          },
          keySeparator: '.',
          nsSeparator: ':',
        },
        pages: [
          {
            matchPath: '/:lang?/painting/:id',
            getLanguageFromPath: true,
          },
        ],
      },
    },
  ],
}
