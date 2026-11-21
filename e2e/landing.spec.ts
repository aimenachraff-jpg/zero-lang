import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/ZERO-LANG/)
  })

  test('displays hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Advanced English')
  })

  test('displays features', async ({ page }) => {
    await expect(page.locator('text=Long-Form Lessons')).toBeVisible()
    await expect(page.locator('text=Free & Open Source')).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.click('text=Curriculum')
    await expect(page).toHaveURL(/\/curriculum/)

    await page.goto('/')
    await page.click('text=Placement')
    await expect(page).toHaveURL(/\/placement/)
  })

  test('CTA buttons navigate correctly', async ({ page }) => {
    await page.click('text=Start Learning Free')
    await expect(page).toHaveURL(/\/auth\/signup/)

    await page.goBack()
    await page.click('text=Browse the Library')
    await expect(page).toHaveURL(/\/curriculum/)
  })
})

test.describe('Curriculum Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/curriculum')
  })

  test('loads curriculum page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Curriculum')
  })
})

test.describe('Placement Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/placement')
  })

  test('loads placement page', async ({ page }) => {
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