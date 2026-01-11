import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../LanguageSwitcher'

// Mock the useI18next hook
const mockChangeLanguage = jest.fn()
jest.mock('gatsby-plugin-react-i18next', () => ({
  useI18next: () => ({
    languages: ['en', 'zh'],
    language: 'en',
    changeLanguage: mockChangeLanguage,
  }),
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear()
  })

  it('renders language buttons', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('中文')).toBeInTheDocument()
  })

  it('marks current language as active', () => {
    render(<LanguageSwitcher />)
    const enButton = screen.getByText('EN')
    expect(enButton).toHaveAttribute('aria-current', 'true')
  })

  it('calls changeLanguage when clicking a language button', () => {
    render(<LanguageSwitcher />)
    const zhButton = screen.getByText('中文')
    fireEvent.click(zhButton)
    expect(mockChangeLanguage).toHaveBeenCalledWith('zh')
  })

  it('has correct navigation role and label', () => {
    render(<LanguageSwitcher />)
    const nav = screen.getByRole('navigation', { name: /language selection/i })
    expect(nav).toBeInTheDocument()
  })

  it('sets lang attribute on buttons', () => {
    render(<LanguageSwitcher />)
    const enButton = screen.getByText('EN')
    const zhButton = screen.getByText('中文')
    expect(enButton).toHaveAttribute('lang', 'en')
    expect(zhButton).toHaveAttribute('lang', 'zh')
  })
})
