import { test as setup } from '@playwright/test';
import 'dotenv/config';

import { loginAsAdmin } from '../helpers/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    'ADMIN_EMAIL atau ADMIN_PASSWORD belum tersedia'
  );
}

setup('authenticate admin', async ({ page }) => {

  await loginAsAdmin(
    page,
    ADMIN_EMAIL,
    ADMIN_PASSWORD
  );

  await page.context().storageState({
    path: 'auth/admin.json',
  });

});