import { test, expect } from '@playwright/test';

test('capture, resurface, persist, and control memory locally', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('afterimage:welcome:v1', 'seen');
    localStorage.setItem('afterimage:first-memory-guide:v1', 'dismissed');
  });
  await page.reload();

  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByLabel('Memory for future you').fill('Use Railway for the next small production service because deployment is fast and rollback is simple.');
  await page.getByLabel('Return condition').fill('When I am choosing a simple production hosting platform');
  await page.getByLabel('Why it matters').fill('This avoids repeating the hosting comparison next time.');
  await page.getByRole('button', { name: /store afterimage/i }).click();

  await expect(page.getByText(/memory created/i).first()).toBeVisible();
  await page.getByLabel('Simulate current context').fill('When I am choosing a simple production hosting platform');
  await page.getByRole('button', { name: /test context/i }).click();
  await expect(page.getByText(/Why now:/i)).toBeVisible();
  await expect(page.getByText(/Railway/i).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Railway/i).first()).toBeVisible();

  await page.goto('/settings');
  await expect(page.getByText(/Your memory\. Your controls\./i)).toBeVisible();
  await expect(page.getByText(/Encrypted backup/i)).toBeVisible();

  await page.getByPlaceholder(/backup password \(8\+ chars\)/i).fill('afterimage-e2e-password');
  await page.getByPlaceholder(/confirm password/i).fill('afterimage-e2e-password');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /secure export/i }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();
  await expect(page.getByText(/encrypted backup created locally/i)).toBeVisible();

  await page.evaluate(() => localStorage.removeItem('afterimage:memories:v2'));
  await page.reload();
  await expect(page.getByText(/Encrypted backup/i)).toBeVisible();

  await page.getByPlaceholder(/backup password$/i).fill('afterimage-e2e-password');
  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.setInputFiles(backupPath);
  await expect(page.getByText(/encrypted backup restored and merged/i)).toBeVisible();

  await page.goto('/');
  await expect(page.getByText(/Railway/i).first()).toBeVisible();
});
