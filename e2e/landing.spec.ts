import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ZERO-LANG/)
    await expect(page.locator('h1')).toContainText('Advanced English')
  })

  test('displays features', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Long-Form Lessons')).toBeVisible()
  })

  test('navigation to curriculum works', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Curriculum')
    await expect(page).toHaveURL(/\/curriculum/)
  })

  test('CTA buttons navigate correctly', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Start Learning Free')
    await expect(page).toHaveURL(/\/auth\/signup/)
  })
})

test.describe('Curriculum Page', () => {
  test('loads curriculum page', async ({ page }) => {
    await page.goto('/curriculum')
    await expect(page.locator('h1')).toContainText('Curriculum')
  })
})

test.describe('Placement Page', () => {
  test('loads placement page', async ({ page }) => {
    await page.goto('/placement')
    await expect(page.locator('h1')).toContainText('Placement')
  })
})

test.describe('Authentication', () => {
  test('sign in page loads', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.locator('h1')).toContainText('Sign')
  })

  test('sign up page loads', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.locator('h1')).toContainText('Create')
  })
})

test.describe('Accessibility', () => {
  test('landing page has proper heading structure', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
  })
})