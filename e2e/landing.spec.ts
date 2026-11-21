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
    await expect(page.locator('h1')).toContainText('World Knowledge')
  })

  test('displays features', async ({ page }) => {
    await expect(page.locator('text=Structured B2–C2 Curriculum')).toBeVisible()
    await expect(page.locator('text=Knowledge-Rich Content')).toBeVisible()
    await expect(page.locator('text=AI Tutor (BYOK)')).toBeVisible()
    await expect(page.locator('text=Honest CEFR Progress Tracking')).toBeVisible()
    await expect(page.locator('text=Free & Open Source')).toBeVisible()
    await expect(page.locator('text=Offline-First & Accessible')).toBeVisible()
  })

  test('displays curriculum topics', async ({ page }) => {
    await expect(page.locator('text=Artificial Intelligence')).toBeVisible()
    await expect(page.locator('text=Climate Change')).toBeVisible()
    await expect(page.locator('text=Economics')).toBeVisible()
    await expect(page.locator('text=Philosophy')).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.click('text=Curriculum')
    await expect(page).toHaveURL(/\/curriculum/)
    
    await page.click('text=Progress')
    await expect(page).toHaveURL(/\/progress/)
    
    await page.click('text=Tutor')
    await expect(page).toHaveURL(/\/tutor/)
    
    await page.click('text=Placement')
    await expect(page).toHaveURL(/\/placement/)
  })

  test('CTA buttons navigate correctly', async ({ page }) => {
    await page.click('text=Start Learning Free')
    await expect(page).toHaveURL(/\/auth\/signup/)
    
    await page.goBack()
    await page.click('text=Browse Curriculum')
    await expect(page).toHaveURL(/\/curriculum/)
  })

  test('displays trust indicators', async ({ page }) => {
    await expect(page.locator('text=MIT Licensed')).toBeVisible()
    await expect(page.locator('text=No Tracking')).toBeVisible()
    await expect(page.locator('text=CEFR Aligned')).toBeVisible()
    await expect(page.locator('text=Community Driven')).toBeVisible()
  })
})

test.describe('Curriculum Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/curriculum')
  })

  test('loads curriculum page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Structured Curriculum')
  })

  test('displays unit cards', async ({ page }) => {
    await expect(page.locator('text=Artificial Intelligence Fundamentals')).toBeVisible()
    await expect(page.locator('text=Climate Science & Policy')).toBeVisible()
    await expect(page.locator('text=Global Economics')).toBeVisible()
  })

  test('topic filter buttons present', async ({ page }) => {
    await expect(page.locator('text=All Topics')).toBeVisible()
    await expect(page.locator('text=Artificial Intelligence')).toBeVisible()
    await expect(page.locator('text=Climate Change')).toBeVisible()
  })
})

test.describe('Placement Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/placement')
  })

  test('loads placement page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Placement Test')
  })

  test('displays test sections', async ({ page }) => {
    await expect(page.locator('text=Reading Comprehension')).toBeVisible()
    await expect(page.locator('text=Listening Comprehension')).toBeVisible()
    await expect(page.locator('text=Grammar in Context')).toBeVisible()
    await expect(page.locator('text=Vocabulary Depth')).toBeVisible()
  })

  test('displays what you get', async ({ page }) => {
    await expect(page.locator('text=Overall CEFR level')).toBeVisible()
    await expect(page.locator('text=Per-skill levels')).toBeVisible()
    await expect(page.locator('text=Can-do statement mastery map')).toBeVisible()
  })
})

test.describe('Authentication', () => {
  test('sign in page loads', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.locator('h1')).toContainText('Sign in')
    await expect(page.locator('text=Email')).toBeVisible()
    await expect(page.locator('text=Password')).toBeVisible()
    await expect(page.locator('text=GitHub')).toBeVisible()
    await expect(page.locator('text=Google')).toBeVisible()
  })

  test('sign up page loads', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.locator('h1')).toContainText('Create Account')
    await expect(page.locator('text=Full Name')).toBeVisible()
    await expect(page.locator('text=Native Language')).toBeVisible()
    await expect(page.locator('text=Learning Goal')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('landing page has proper heading structure', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    for (const img of await images.all()) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })

  test('focus visible on interactive elements', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })
})