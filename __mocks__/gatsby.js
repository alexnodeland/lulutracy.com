const React = require('react')

const gatsby = jest.requireActual('gatsby')

module.exports = {
  ...gatsby,
  graphql: jest.fn(),
  Link: jest
    .fn()
    .mockImplementation(({ to, children, ...rest }) =>
      React.createElement('a', { href: to, ...rest }, children)
    ),
  StaticQuery: jest.fn(),
  useStaticQuery: jest.fn(),
  navigate: jest.fn(),
}
