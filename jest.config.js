module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    // Handle CSS modules
    '\\.module\\.css$': 'identity-obj-proxy',
    // Handle CSS imports
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle Gatsby module
    '^gatsby$': '<rootDir>/__mocks__/gatsby.js',
    '^gatsby-plugin-image$': '<rootDir>/__mocks__/gatsby-plugin-image.js',
    // Handle Gatsby i18n plugin
    '^gatsby-plugin-react-i18next$':
      '<rootDir>/__mocks__/gatsby-plugin-react-i18next.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.cache/', '/public/'],
  transformIgnorePatterns: ['node_modules/(?!(gatsby|gatsby-script)/)'],
  globals: {
    __PATH_PREFIX__: '',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 75,
      lines: 90,
      statements: 90,
    },
  },
}
