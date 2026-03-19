import { test, expect } from '@playwright/test';

test.describe('AirPeace Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('New User — Self — Personal', async ({ page }) => {
    await page.getByText('New User — Self — Personal').click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    await expect(page.getByText('Payment securely processed via PLAID')).toBeVisible();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('New User — Self — Company', async ({ page }) => {
    await page.getByText('New User — Self — Company').click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    await page.getByPlaceholder('E.g. RC 123654').fill('1234');
    await expect(page.getByText('Acme Limited')).toBeVisible();
    await page.locator('select').selectOption({ label: 'John Doe' });
    await expect(page.getByText('Director verified')).toBeVisible();
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('New User — Third Party — Personal', async ({ page }) => {
    await page.getByText('New User — Third Party — Personal').click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    await page.getByPlaceholder('Enter full name').fill('Jane Smith');
    await page.getByPlaceholder('Enter email address').fill('jane@example.com');
    await page.getByPlaceholder('DD/MM/YYYY').fill('01/01/1980');
    await page.getByPlaceholder('7911 123456').fill('7911987654');
    await page.getByPlaceholder('E.g 54, Chevron Drive').fill('10 Main St');
    await page.getByPlaceholder('E.g. SW1A 1AA').fill('E1 1AA');
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('New User — Third Party — Company', async ({ page }) => {
    await page.getByText('New User — Third Party — Company').click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await page.getByPlaceholder('E.g. RC 123654').fill('1234');
    await expect(page.getByText('Acme Limited')).toBeVisible();
    await page.locator('select').selectOption({ label: 'John Doe' });
    await expect(page.getByText('Director verified')).toBeVisible();
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Registered — Self — Personal', async ({ page }) => {
    await page.getByText('Registered — Self — Personal').first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    await expect(page.getByText('Confirm payment details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Registered — Self — Company', async ({ page }) => {
    await page.getByText('Registered — Self — Company').first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    await expect(page.getByText('Confirm payment details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Registered — Third Party — Personal', async ({ page }) => {
    await page.getByText('Registered — Third Party — Personal').first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    await expect(page.getByText('Confirm payment details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Registered — Third Party — Company', async ({ page }) => {
    await page.getByText('Registered — Third Party — Company').first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    await expect(page.getByText('Confirm payment details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });
});
