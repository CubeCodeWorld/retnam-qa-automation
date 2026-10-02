import { test, expect } from '@playwright/test';
import 'dotenv/config';

test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    'ADMIN_EMAIL atau ADMIN_PASSWORD belum diisi di file .env'
  );
}

test.describe('Login RETNAM', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });


  test('admin berhasil login', async ({ page }) => {

    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);

    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Keluar' })
    ).toBeVisible();
  });


  test('login gagal jika password salah', async ({ page }) => {

    await page.getByLabel('Email').fill(ADMIN_EMAIL);

    await page.getByLabel('Password').fill(
      'password-yang-pasti-salah'
    );

    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Selamat datang di RETNAM'
      })
    ).toBeVisible();
  });


  test('admin berhasil logout', async ({ page }) => {

    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);

    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Keluar' }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Selamat datang di RETNAM'
      })
    ).toBeVisible();
  });

});