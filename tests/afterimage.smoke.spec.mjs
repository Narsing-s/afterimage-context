import { test, expect } from '@playwright/test';

test('capture, resurface, persist, and control memory locally', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const close = page.getByRole('button', { name: /enter afterimage/i });
  if (await close.count()) await close.click();

  await page.getByPlaceholder(/capture a thought/i).fill('Use Railway for the next small production service because deployment is fast and rollback is simple.');
  await page.getByPlaceholder(/return condition/i).fill('When I am choosing a simple production hosting platform');
  await page.getByPlaceholder(/why it matters/i).fill('This avoids repeating the hosting comparison next time.');
  await page.getByRole('button', { name: /store memory/i }).click();

  await expect(page.getByText(/memory created/i)).toBeVisible();
  await page.getByRole('button', { name: /test context/i }).click();
  await expect(page.getByText(/why now/i)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Railway/i).first()).toBeVisible();

  await page.goto('/settings');
  await expect(page.getByText(/Your memory\. Your controls\./i)).toBeVisible();
  await expect(page.getByText(/Encrypted backup/i)).toBeVisible();
});
