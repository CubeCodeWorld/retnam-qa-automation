import { cleanupTestTransaction } from '../helpers/db';
import { DashboardPage } from '../pages/DashboardPage';
import { TransaksiPage } from '../pages/TransaksiPage';
import { loginAsAdmin } from '../helpers/auth';
import { test, expect } from '@playwright/test';
import 'dotenv/config';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    'ADMIN_EMAIL atau ADMIN_PASSWORD belum diisi di file .env'
  );
}


test.describe('Transaksi RETNAM', () => {

  test.describe.configure({ mode: 'serial' });  

 test.beforeEach(async ({ page }) => {
  await page.goto('./');

  await expect(
    page.getByRole('heading', { name: 'Dashboard' })
  ).toBeVisible();
});


  test('admin dapat membuka form uang masuk', async ({ page }) => {

    // LOCATOR + ACTION
    await page
      .getByRole('button', { name: 'Transaksi' })
      .click();

    // ASSERTION
    await expect(
      page.getByLabel('Cari transaksi')
    ).toBeVisible();

    // ACTION
    await page
      .getByRole('button', { name: 'Uang masuk' })
      .click();

    // ASSERTION
    await expect(
      page.getByRole('heading', { name: 'Catat uang masuk' })
    ).toBeVisible();

  });


  test('admin dapat mengisi form uang masuk', async ({ page }) => {

  const transaksiPage = new TransaksiPage(page);

  await transaksiPage.bukaMenuTransaksi();
  await transaksiPage.bukaFormUangMasuk();

  await transaksiPage.isiUangMasuk(
    '10000',
    'Test Automation Playwright',
    'QA Testing'
  );

  await expect(
    transaksiPage.nominal
  ).toHaveValue('10000');

  await expect(
    transaksiPage.keterangan
  ).toHaveValue('Test Automation Playwright');

  await expect(
    transaksiPage.kategori
  ).toHaveValue('QA Testing');

  await transaksiPage.batal();

  await expect(
    transaksiPage.headingUangMasuk
  ).not.toBeVisible();

});



test('uang masuk tidak dapat disimpan jika nominal kosong', async ({ page }) => {

  const transaksiPage = new TransaksiPage(page);

  await transaksiPage.bukaMenuTransaksi();
  await transaksiPage.bukaFormUangMasuk();

  await transaksiPage.isiUangMasuk(
    '',
    'Negative Test Playwright',
    'QA Testing'
  );

  await transaksiPage.simpan();

  await expect(
    transaksiPage.headingUangMasuk
  ).toBeVisible();

  await expect(
    transaksiPage.nominal
  ).toHaveValue('');

  const validationMessage =
    await transaksiPage.nominal.evaluate(
      (element: HTMLInputElement) =>
        element.validationMessage
    );

  expect(validationMessage).not.toBe('');

});


test('admin berhasil menyimpan transaksi uang masuk', async ({ page }) => {

  const transaksiPage = new TransaksiPage(page);
  const testId = `QA-E2E-${Date.now()}`;

  try {

    await transaksiPage.bukaMenuTransaksi();

    await transaksiPage.bukaFormUangMasuk();

    await transaksiPage.isiUangMasuk(
      '1000',
      testId,
      'QA Automation'
    );

    await transaksiPage.simpan();

    await expect(
      page.getByText(testId)
    ).toBeVisible();

  } finally {

    await cleanupTestTransaction(testId);

  }

});


test('saldo bertambah sesuai transaksi uang masuk', async ({ page }) => {

  const transaksiPage = new TransaksiPage(page);
  const dashboardPage = new DashboardPage(page);

  const nominalMasuk = 1000;
  const testId = `QA-SALDO-${Date.now()}`;

  const saldoSebelum = await dashboardPage.ambilSaldo();

  console.log('Saldo sebelum:', saldoSebelum);

  try {

    await transaksiPage.bukaMenuTransaksi();
    await transaksiPage.bukaFormUangMasuk();

    await transaksiPage.isiUangMasuk(
      String(nominalMasuk),
      testId,
      'QA Automation'
    );

    await transaksiPage.simpan();

    await expect(
      page.getByText(testId)
    ).toBeVisible();

    await dashboardPage.bukaDashboard();

    const saldoSesudah = await dashboardPage.ambilSaldo();

    console.log('Saldo sesudah:', saldoSesudah);

    expect(saldoSesudah).toBe(
      saldoSebelum + nominalMasuk
    );

  } finally {

    await cleanupTestTransaction(testId);

  }

  // Verifikasi database balik seperti sebelum test
  await page.reload();

  await dashboardPage.pastikanTerbuka();

  const saldoSetelahCleanup =
    await dashboardPage.ambilSaldo();

  console.log(
    'Saldo setelah cleanup:',
    saldoSetelahCleanup
  );

  expect(saldoSetelahCleanup).toBe(saldoSebelum);

});

});