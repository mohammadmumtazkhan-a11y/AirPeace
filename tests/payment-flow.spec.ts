import { test, expect } from '@playwright/test';

test.describe('AirPeace Payment Flow - Vibe Coding Brief', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  async function handleMandatoryModal(page: any) {
    await expect(page.getByText('Important Information')).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /Acknowledge/i }).click();
    await expect(page.getByText('Important Information')).not.toBeVisible();
  }

  test('Personal — Success', async ({ page }) => {
    await page.getByText('Personal — Success', { exact: true }).click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await handleMandatoryModal(page);
    
    // Fill the clean form
    await page.getByPlaceholder('Must be exactly as written').fill('Jane Doe');
    await page.getByPlaceholder('name@domain.com').fill('jane@example.com');
    await page.getByPlaceholder('DD/MM/YYYY').fill('01/01/1990');
    await page.getByPlaceholder('+44 7911 123456').fill('7911987654');
    await page.getByPlaceholder('123 Example Street').fill('10 Main St');
    await page.getByPlaceholder('SW1A 1AA').fill('E1 1AA');
    
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    
    // Goes to Validation then Success
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Personal — Name Mismatch', async ({ page }) => {
    await page.getByText('Personal — Name Mismatch', { exact: true }).click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await handleMandatoryModal(page);
    
    await page.getByPlaceholder('Must be exactly as written').fill('Mismatched Name');
    await page.getByPlaceholder('name@domain.com').fill('bad@example.com');
    await page.getByPlaceholder('DD/MM/YYYY').fill('01/01/1990');
    await page.getByPlaceholder('+44 7911 123456').fill('7911');
    await page.getByPlaceholder('123 Example Street').fill('10 Main St');
    await page.getByPlaceholder('SW1A 1AA').fill('E1 1AA');
    
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Verification Failed')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('does not match')).toBeVisible();
    
    // Test clicking Restart
    await page.getByRole('button', { name: /Restart with new payer details/i }).click();
    await expect(page.getByText('Payer Onboarding Information')).toBeVisible();
  });

  test('Company — Success', async ({ page }) => {
    await page.getByText('Company — Success', { exact: true }).click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await handleMandatoryModal(page);
    
    await page.getByPlaceholder('Enter your full legal name').fill('John Manager');
    await page.getByPlaceholder('name@company.com').fill('john@company.com');
    await page.getByPlaceholder('E.g. RC 123654').fill('1234');
    await expect(page.getByText('Acme Limited')).toBeVisible();
    await page.locator('select').selectOption({ label: 'Jane Smith' });
    await expect(page.getByText('Director Verified')).toBeVisible();
    
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Company — Name Mismatch', async ({ page }) => {
    await page.getByText('Company — Name Mismatch', { exact: true }).click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await handleMandatoryModal(page);
    
    await page.getByPlaceholder('Enter your full legal name').fill('Some Name');
    await page.getByPlaceholder('name@company.com').fill('a@b.com');
    await page.getByPlaceholder('E.g. RC 123654').fill('1234');
    await expect(page.getByText('Acme Limited')).toBeVisible();
    await page.locator('select').selectOption({ label: 'John Doe' });
    await expect(page.getByText('Director Verified')).toBeVisible();
    
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Verification Failed')).toBeVisible({ timeout: 15000 });
    
    // Test clicking Restart
    await page.getByRole('button', { name: /Restart with new payer details/i }).click();
    await expect(page.getByText('Payer Onboarding Information')).toBeVisible();
  });

  test('Company — Insufficient Funds', async ({ page }) => {
    await page.getByText('Company — Insufficient Funds', { exact: true }).click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await handleMandatoryModal(page);
    
    await page.getByPlaceholder('Enter your full legal name').fill('Some Name');
    await page.getByPlaceholder('name@company.com').fill('a@b.com');
    await page.getByPlaceholder('E.g. RC 123654').fill('1234');
    await expect(page.getByText('Acme Limited')).toBeVisible();
    await page.locator('select').selectOption({ label: 'John Doe' });
    await expect(page.getByText('Director Verified')).toBeVisible();
    
    await page.getByRole('button', { name: /Review & Continue/i }).click();
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Payment Declined')).toBeVisible({ timeout: 15000 });
    
    // Test clicking Retry
    await page.getByRole('button', { name: /Retry with another bank account/i }).click();
    await expect(page.getByText('Redirecting to your bank...')).toBeVisible();
  });

  test('Registered Personal — Success', async ({ page }) => {
    await page.getByText('Registered Personal — Success', { exact: true }).first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    // Recognition screen
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    
    await handleMandatoryModal(page);
    
    // Review screen
    await expect(page.getByText('Confirm your payer details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Registered Company — Insufficient Funds', async ({ page }) => {
    await page.getByText('Registered Company — Insufficient Funds', { exact: true }).first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    
    await handleMandatoryModal(page);
    
    await expect(page.getByText('Confirm your payer details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Payment Declined')).toBeVisible({ timeout: 15000 });
    
    // Test clicking Retry
    await page.getByRole('button', { name: /Retry with another bank account/i }).click();
    await expect(page.getByText('Redirecting to your bank...')).toBeVisible();
  });

  test('Registered Company — Success', async ({ page }) => {
    await page.getByText('Registered Company — Success', { exact: true }).first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    
    await handleMandatoryModal(page);
    
    await expect(page.getByText('Confirm your payer details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Payment successful')).toBeVisible({ timeout: 15000 });
  });

  test('Registered Personal — Name Mismatch', async ({ page }) => {
    await page.getByText('Registered Personal — Name Mismatch', { exact: true }).first().click();
    await page.getByText('Pay by Bank (instant transfer)').click();
    await page.getByRole('button', { name: /Make Payment/i }).click();
    await page.getByRole('button', { name: /Continue to Payment/i }).click();
    
    await expect(page.getByText('Welcome back!')).toBeVisible();
    await page.getByRole('button', { name: /Continue with these details/i }).click();
    
    await handleMandatoryModal(page);
    
    await expect(page.getByText('Confirm your payer details')).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Pay/i }).click();
    
    await expect(page.getByText('Validation in progress')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Verification Failed')).toBeVisible({ timeout: 15000 });
  });
});
