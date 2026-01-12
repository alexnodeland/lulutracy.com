import { test, expect } from '@playwright/test'

test.describe('Internationalization', () => {
  test('displays language switcher', async ({ page }) => {
    await page.goto('/')

    // Language switcher should be visible
    const languageSwitcher = page.locator('[data-testid="language-switcher"]')
    await expect(languageSwitcher).toBeVisible()
  })

  test('switches to Chinese (Simplified)', async ({ page }) => {
    await page.goto('/')

    // Click language switcher
    await page.locator('[data-testid="language-switcher"]').click()

    // Select Chinese
    await page.locator('[data-testid="lang-zh"]').click()

    // URL should include /zh prefix
    await expect(page).toHaveURL(/\/zh/)
  })

  test('switches to Cantonese', async ({ page }) => {
    await page.goto('/')

    // Click language switcher
    await page.locator('[data-testid="language-switcher"]').click()

    // Select Cantonese
    await page.locator('[data-testid="lang-yue"]').click()

    // URL should include /yue prefix
    await expect(page).toHaveURL(/\/yue/)
  })

  test('switches to Malay', async ({ page }) => {
    await page.goto('/')

    // Click language switcher
    await page.locator('[data-testid="language-switcher"]').click()

    // Select Malay
    await page.locator('[data-testid="lang-ms"]').click()

    // URL should include /ms prefix
    await expect(page).toHaveURL(/\/ms/)
  })

  test('persists language across navigation', async ({ page }) => {
    await page.goto('/')

    // Switch to Chinese
    await page.locator('[data-testid="language-switcher"]').click()
    await page.locator('[data-testid="lang-zh"]').click()

    // Navigate to about page
    await page.locator('[data-testid="nav-about"]').click()

    // URL should still include /zh prefix
    await expect(page).toHaveURL(/\/zh\/about/)
  })

  test('returns to English', async ({ page }) => {
    // Start with Chinese
    await page.goto('/zh')

    // Click language switcher
    await page.locator('[data-testid="language-switcher"]').click()

    // Select English
    await page.locator('[data-testid="lang-en"]').click()

    // URL should not have language prefix
    await expect(page).not.toHaveURL(/\/(zh|yue|ms)/)
  })
})
