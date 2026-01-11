require('@testing-library/jest-dom')

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe(element) {
    // Immediately trigger with isIntersecting: true for testing
    this.callback([{ isIntersecting: true, target: element }])
  }

  unobserve() {
    return null
  }

  disconnect() {
    return null
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
