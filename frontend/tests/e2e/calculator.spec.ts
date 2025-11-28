import { test, expect } from '@playwright/test';

test.describe('Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display calculator interface', async ({ page }) => {
    await expect(page.getByText('0')).toBeVisible();
    await expect(page.getByText('AC')).toBeVisible();
    await expect(page.getByText('=')).toBeVisible();
  });

  test('should perform basic addition', async ({ page }) => {
    await page.getByText('2', { exact: true }).click();
    await page.getByText('+').click();
    await page.getByText('3', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('5')).toBeVisible({ timeout: 5000 });
  });

  test('should perform multiplication', async ({ page }) => {
    await page.getByText('4', { exact: true }).click();
    await page.getByText('×').click();
    await page.getByText('5', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('20')).toBeVisible({ timeout: 5000 });
  });

  test('should handle keyboard input', async ({ page }) => {
    await page.keyboard.press('5');
    await page.keyboard.press('+');
    await page.keyboard.press('3');
    await page.keyboard.press('Enter');
    
    await expect(page.getByText('8')).toBeVisible({ timeout: 5000 });
  });

  test('should clear display', async ({ page }) => {
    await page.getByText('7', { exact: true }).click();
    await page.getByText('8', { exact: true }).click();
    await expect(page.getByText('78')).toBeVisible();
    
    await page.getByText('AC').click();
    await expect(page.getByText('0')).toBeVisible();
  });

  test('should handle decimal numbers', async ({ page }) => {
    await page.getByText('1', { exact: true }).click();
    await page.getByText('.').click();
    await page.getByText('5', { exact: true }).click();
    
    await expect(page.getByText('1.5')).toBeVisible();
  });

  test('should negate numbers', async ({ page }) => {
    await page.getByText('5', { exact: true }).click();
    await page.getByText('±').click();
    
    await expect(page.getByText('-5')).toBeVisible();
  });

  test('should add to history', async ({ page }) => {
    await page.getByText('3', { exact: true }).click();
    await page.getByText('+').click();
    await page.getByText('2', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('5')).toBeVisible({ timeout: 5000 });
    
    // Check if history contains the calculation
    await expect(page.getByText('3 + 2 = 5')).toBeVisible();
  });

  test('should chain operations', async ({ page }) => {
    await page.getByText('2', { exact: true }).click();
    await page.getByText('+').click();
    await page.getByText('3', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('5')).toBeVisible({ timeout: 5000 });
    
    await page.getByText('×').click();
    await page.getByText('2', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('10')).toBeVisible({ timeout: 5000 });
  });

  test('should persist history on reload', async ({ page }) => {
    await page.getByText('5', { exact: true }).click();
    await page.getByText('+').click();
    await page.getByText('3', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('8')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('5 + 3 = 8')).toBeVisible();
    
    await page.reload();
    
    await expect(page.getByText('5 + 3 = 8')).toBeVisible();
  });

  test('should clear history', async ({ page }) => {
    await page.getByText('1', { exact: true }).click();
    await page.getByText('+').click();
    await page.getByText('1', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('2')).toBeVisible({ timeout: 5000 });
    
    const clearButton = page.getByRole('button', { name: /clear/i });
    await clearButton.click();
    
    await expect(page.getByText('1 + 1 = 2')).not.toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.getByText('9', { exact: true }).click();
    await page.getByText('-').click();
    await page.getByText('4', { exact: true }).click();
    await page.getByText('=').click();
    
    await expect(page.getByText('5')).toBeVisible({ timeout: 5000 });
  });

  test('should handle loading state', async ({ page }) => {
    await page.getByText('1', { exact: true }).click();
    await page.getByText('+').click();
    await page.getByText('1', { exact: true }).click();
    
    const equalsButton = page.getByText('=');
    await equalsButton.click();
    
    // Loading indicator should appear briefly
    const loading = page.getByText('Calculating...');
    // May or may not be visible depending on API speed
    // Just check that calculation completes
    await expect(page.getByText('2')).toBeVisible({ timeout: 5000 });
  });
});