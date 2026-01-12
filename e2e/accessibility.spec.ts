import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('skip link is functional', async ({ page }) => {
    await page.goto('/')

    // Focus skip link (usually appears on Tab)
    await page.keyboard.press('Tab')

    // Skip link should be visible when focused
    const skipLink = page.locator('[data-testid="skip-link"]')
    await expect(skipLink).toBeFocused()

    // Click skip link
    await skipLink.click()

    // Main content should be focused
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })

  test('all images have alt text', async ({ page }) => {
    await page.goto('/')

    // Get all images
    const images = page.locator('img')
    const count = await images.count()

    // Each image should have alt text
    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Tab through navigation
    await page.keyboard.press('Tab') // Skip link
    await page.keyboard.press('Tab') // First nav item

    // Navigation link should be focused
    const focusedElement = page.locator(':focus')
    const tagName = await focusedElement.evaluate((el) =>
      el.tagName.toLowerCase()
    )

    expect(tagName).toBe('a')
  })

  test('theme toggle is keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Tab to theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    await themeToggle.focus()

    // Get initial theme
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    // Press Enter to toggle
    await page.keyboard.press('Enter')

    // Theme should change
    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(newTheme).not.toBe(initialTheme)
  })

  test('language switcher is keyboard accessible', async ({ page }) => {
    await page.goto('/')

    // Focus language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"]')
    await languageSwitcher.focus()

    // Press Enter to open
    await page.keyboard.press('Enter')

    // Language options should be visible
    const langOption = page.locator('[data-testid="lang-zh"]')
    await expect(langOption).toBeVisible()
  })

  test('painting detail has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Navigate to first painting
    await page.locator('[data-testid="gallery-image"]').first().click()

    // Check heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)

    // Title should be in h1 or h2
    const paintingTitle = page.locator('[data-testid="painting-title"]')
    const titleTag = await paintingTitle.evaluate((el) =>
      el.tagName.toLowerCase()
    )

    expect(['h1', 'h2']).toContain(titleTag)
  })

  test('focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/')

    // Tab to an interactive element
    await page.keyboard.press('Tab')

    // Check that focus outline is visible
    const focusedElement = page.locator(':focus')
    const outlineStyle = await focusedElement.evaluate(
      (el) => getComputedStyle(el).outline
    )

    // Should have some visible outline
    expect(outlineStyle).not.toBe('0px none rgb(0, 0, 0)')
  })
})

test.describe('Accessibility - Screen Reader', () => {
  test('page has proper document title', async ({ page }) => {
    await page.goto('/')

    const title = await page.title()
    expect(title).toContain('lulutracy')
  })

  test('main content has proper landmark role', async ({ page }) => {
    await page.goto('/')

    // Main content should have main role
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('navigation has proper landmark role', async ({ page }) => {
    await page.goto('/')

    // Navigation should have nav element
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })
})
