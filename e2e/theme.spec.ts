import { test, expect } from '@playwright/test'

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('displays theme toggle button', async ({ page }) => {
    await page.goto('/')

    // Theme toggle should be visible
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    await expect(themeToggle).toBeVisible()
  })

  test('toggles from light to dark mode', async ({ page }) => {
    await page.goto('/')

    // Get initial theme
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    // Click theme toggle
    await page.locator('[data-testid="theme-toggle"]').click()

    // Theme should change
    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(newTheme).not.toBe(initialTheme)
  })

  test('toggles back to light mode', async ({ page }) => {
    await page.goto('/')

    // Toggle twice
    await page.locator('[data-testid="theme-toggle"]').click()
    await page.locator('[data-testid="theme-toggle"]').click()

    // Should be back to light
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(theme).toBe('light')
  })

  test('persists theme preference in localStorage', async ({ page }) => {
    await page.goto('/')

    // Toggle to dark
    await page.locator('[data-testid="theme-toggle"]').click()

    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'))

    expect(storedTheme).toBe('dark')
  })

  test('persists theme across page reload', async ({ page }) => {
    await page.goto('/')

    // Toggle to dark
    await page.locator('[data-testid="theme-toggle"]').click()

    // Reload page
    await page.reload()

    // Theme should still be dark
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(theme).toBe('dark')
  })

  test('persists theme across navigation', async ({ page }) => {
    await page.goto('/')

    // Toggle to dark
    await page.locator('[data-testid="theme-toggle"]').click()

    // Navigate to about page
    await page.locator('[data-testid="nav-about"]').click()

    // Theme should still be dark
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(theme).toBe('dark')
  })
})

test.describe('Theme - System Preference', () => {
  test('respects system dark mode preference', async ({ page }) => {
    // Emulate dark mode system preference
    await page.emulateMedia({ colorScheme: 'dark' })

    await page.goto('/')

    // Theme should be dark (if no localStorage override)
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(theme).toBe('dark')
  })

  test('respects system light mode preference', async ({ page }) => {
    // Emulate light mode system preference
    await page.emulateMedia({ colorScheme: 'light' })

    await page.goto('/')

    // Theme should be light
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(theme).toBe('light')
  })
})
