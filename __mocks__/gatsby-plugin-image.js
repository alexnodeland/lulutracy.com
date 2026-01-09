const React = require('react')

const GatsbyImage = jest
  .fn()
  .mockImplementation(({ alt, ...rest }) =>
    React.createElement('img', { src: 'test-image.jpg', alt, ...rest })
  )

const StaticImage = jest
  .fn()
  .mockImplementation(({ src, alt, ...rest }) =>
    React.createElement('img', { src, alt, ...rest })
  )

const getImage = jest.fn().mockImplementation((image) => image)

module.exports = {
  GatsbyImage,
  StaticImage,
  getImage,
}
