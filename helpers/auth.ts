import { expect, Page } from '@playwright/test';

export async function loginAsAdmin(
  page: Page,
  email: string,
  password: string
) {

  await page.goto('./');

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);

  await page.getByRole('button', { name: 'Masuk' }).click();

  await expect(
    page.getByRole('heading', { name: 'Dashboard' })
  ).toBeVisible();
}