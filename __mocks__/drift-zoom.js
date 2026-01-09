// Manual mock for drift-zoom module
const Drift = jest.fn().mockImplementation(() => ({
  disable: jest.fn(),
  enable: jest.fn(),
  setZoomImageURL: jest.fn(),
  destroy: jest.fn(),
}))

module.exports = Drift
module.exports.default = Drift
