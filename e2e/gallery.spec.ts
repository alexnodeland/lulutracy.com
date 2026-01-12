import { test, expect } from '@playwright/test'

test.describe('Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays gallery with paintings', async ({ page }) => {
    // Wait for gallery to load
    await expect(page.locator('[data-testid="gallery"]')).toBeVisible()

    // Check that paintings are displayed
    const paintings = page.locator('[data-testid="gallery-image"]')
    await expect(paintings.first()).toBeVisible()
  })

  test('navigates to painting detail page on click', async ({ page }) => {
    // Click on first painting
    const firstPainting = page.locator('[data-testid="gallery-image"]').first()
    await firstPainting.click()

    // Should navigate to painting detail page
    await expect(page).toHaveURL(/\/painting\//)

    // Painting detail should be visible
    await expect(page.locator('[data-testid="painting-detail"]')).toBeVisible()
  })

  test('displays painting metadata on detail page', async ({ page }) => {
    // Navigate to first painting
    await page.locator('[data-testid="gallery-image"]').first().click()

    // Check metadata elements exist
    await expect(page.locator('[data-testid="painting-title"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="painting-description"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="painting-details"]')).toBeVisible()
  })

  test('prev/next navigation works on painting detail', async ({ page }) => {
    // Navigate to first painting
    await page.locator('[data-testid="gallery-image"]').first().click()
    const initialUrl = page.url()

    // Click next if available
    const nextButton = page.locator('[data-testid="nav-next"]')
    if (await nextButton.isVisible()) {
      await nextButton.click()

      // URL should change
      await expect(page).not.toHaveURL(initialUrl)

      // Click prev to go back
      const prevButton = page.locator('[data-testid="nav-prev"]')
      await expect(prevButton).toBeVisible()
      await prevButton.click()

      // Should be back to original painting
      await expect(page).toHaveURL(initialUrl)
    }
  })
})

test.describe('Gallery - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('gallery is responsive on mobile', async ({ page }) => {
    await page.goto('/')

    // Gallery should still be visible
    await expect(page.locator('[data-testid="gallery"]')).toBeVisible()

    // Paintings should be visible
    const paintings = page.locator('[data-testid="gallery-image"]')
    await expect(paintings.first()).toBeVisible()
  })
})
