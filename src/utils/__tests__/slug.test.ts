import { generateSlug, generateImageFilename } from '../slug'

describe('generateSlug', () => {
  it('converts title to lowercase', () => {
    expect(generateSlug('Symbiosis')).toBe('symbiosis')
  })

  it('replaces spaces with dashes', () => {
    expect(generateSlug('Night Hours')).toBe('night-hours')
  })

  it('handles multiple spaces', () => {
    expect(generateSlug('Get Lucky Now')).toBe('get-lucky-now')
  })

  it('preserves Roman numerals as lowercase', () => {
    expect(generateSlug('Nature Study I')).toBe('nature-study-i')
    expect(generateSlug('Nature Study II')).toBe('nature-study-ii')
    expect(generateSlug('Nature Study III')).toBe('nature-study-iii')
  })

  it('handles single word titles', () => {
    expect(generateSlug('Flourish')).toBe('flourish')
  })
})

describe('generateImageFilename', () => {
  it('generates filename with .jpeg extension', () => {
    expect(generateImageFilename('Symbiosis')).toBe('symbiosis.jpeg')
  })

  it('handles multi-word titles', () => {
    expect(generateImageFilename('Night Hours')).toBe('night-hours.jpeg')
  })

  it('handles titles with Roman numerals', () => {
    expect(generateImageFilename('Nature Study I')).toBe('nature-study-i.jpeg')
  })
})
