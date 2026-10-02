import { test, expect } from '@playwright/test';
import { cleanupTestTransaction } from '../helpers/db';

import {
  getApiState,
  postIncome,
  hitungSaldo,
  tanggalHariIniWIB,
} from '../helpers/api';

test.describe('API RETNAM', () => {

  test.describe.configure({ mode: 'serial' });

  test('POST transaksi ditolak tanpa CSRF token', async ({ request }) => {

  const body =
  await getApiState(request);

const version =
  body.version;

const tanggal =
  tanggalHariIniWIB();

  const response = await request.post(
    'api/data.php',
    {
      data: {
        action: 'income',
        amount: 1000,
        date: tanggal,
        description: `QA-NO-CSRF-${Date.now()}`,
        category: 'QA Automation',
        version,
      }

      // sengaja TIDAK ADA X-CSRF-Token
    }
  );

  console.log(
    'Status tanpa CSRF:',
    response.status()
  );

  const responseBody = await response.json();

  console.log(
    'Response tanpa CSRF:',
    responseBody
  );

  // ASSERTION YANG LEBIH SPESIFIK
expect(response.status()).toBe(403);

expect(responseBody).toHaveProperty('error');

expect(responseBody.error).toBe(
  'Sesi form kedaluwarsa. Muat ulang halaman.'
);

});

  test('GET data RETNAM sebagai admin', async ({ request }) => {

    const response = await request.get('api/data.php');

    expect(response.status()).toBe(200);

    const body = await response.json();

    console.log('Role:', body.me.role);
    console.log('Version:', body.version);
    console.log(
      'Jumlah transaksi:',
      body.state.entries.length
    );

    expect(body).toHaveProperty('state');
    expect(body).toHaveProperty('me');
    expect(body).toHaveProperty('version');

    expect(body.me.role).toBe('admin');
  });

  test('POST transaksi uang masuk melalui API', async ({ request }) => {

  const testId = `QA-API-${Date.now()}`;
  const nominal = 1000;

  try {

    // GET state awal
    const getBody =
      await getApiState(request);

    const csrf = getBody.csrf;
    const version = getBody.version;

    console.log(
      'CSRF tersedia:',
      Boolean(csrf)
    );

    console.log(
      'Version awal:',
      version
    );


    // POST pemasukan
    const postResponse =
      await postIncome(
        request,
        {
          csrf,
          version,
          amount: nominal,
          description: testId,
        }
      );

    const postBody =
      await postResponse.json();

    console.log(
      'POST status:',
      postResponse.status()
    );

    console.log(
      'POST response:',
      postBody
    );

    expect(
      postResponse.status()
    ).toBe(200);

    expect(
      postBody.ok
    ).toBe(true);


    // GET lagi untuk verifikasi
    const verifyBody =
      await getApiState(request);

    const ditemukan =
      verifyBody.state.entries.some(
        (entry: any) =>
          entry.description === testId &&
          entry.kind === 'income' &&
          entry.amount === nominal
      );

    expect(ditemukan).toBe(true);

  } finally {

    await cleanupTestTransaction(
      testId
    );

  }

});

test('saldo API bertambah sesuai pemasukan', async ({ request }) => {

  const testId =
    `QA-API-SALDO-${Date.now()}`;

  const nominalMasuk = 1000;

  // Ambil kondisi awal
  const beforeBody =
    await getApiState(request);

  const saldoSebelum =
    hitungSaldo(
      beforeBody.state.entries
    );

  const csrf = beforeBody.csrf;
  const version = beforeBody.version;

  console.log(
    'Saldo API sebelum:',
    saldoSebelum
  );

  try {

    // POST pemasukan
    const postResponse =
      await postIncome(
        request,
        {
          csrf,
          version,
          amount: nominalMasuk,
          description: testId,
        }
      );

    expect(
      postResponse.status()
    ).toBe(200);

    const postBody =
      await postResponse.json();

    expect(
      postBody.ok
    ).toBe(true);


    // Ambil kondisi sesudah
    const afterBody =
      await getApiState(request);

    const saldoSesudah =
      hitungSaldo(
        afterBody.state.entries
      );

    console.log(
      'Saldo API sesudah:',
      saldoSesudah
    );


    // Business assertion
    expect(
      saldoSesudah
    ).toBe(
      saldoSebelum + nominalMasuk
    );

  } finally {

    await cleanupTestTransaction(
      testId
    );

  }


  // Pastikan cleanup berhasil
  const cleanupBody =
    await getApiState(request);

  const saldoSetelahCleanup =
    hitungSaldo(
      cleanupBody.state.entries
    );

  console.log(
    'Saldo API setelah cleanup:',
    saldoSetelahCleanup
  );

  expect(
    saldoSetelahCleanup
  ).toBe(saldoSebelum);

});


test('POST ditolak jika menggunakan version lama', async ({ request }) => {

  const testIdPertama =
    `QA-API-VERSION-A-${Date.now()}`;

  const testIdKedua =
    `QA-API-VERSION-B-${Date.now()}`;

  // Ambil state awal
  const stateAwal =
    await getApiState(request);

  const csrf =
    stateAwal.csrf;

  const versionLama =
    stateAwal.version;

  console.log(
    'Version awal:',
    versionLama
  );

  try {

    // POST pertama dengan version valid
    const firstResponse =
      await postIncome(
        request,
        {
          csrf,
          version: versionLama,
          amount: 1000,
          description: testIdPertama,
        }
      );

    expect(
      firstResponse.status()
    ).toBe(200);

    console.log(
      'POST pertama:',
      firstResponse.status()
    );


    // POST kedua sengaja masih pakai version lama
    const staleResponse =
      await postIncome(
        request,
        {
          csrf,
          version: versionLama,
          amount: 1000,
          description: testIdKedua,
        }
      );

    const staleBody =
      await staleResponse.json();

    console.log(
      'Status stale version:',
      staleResponse.status()
    );

    console.log(
      'Response stale version:',
      staleBody
    );


    expect(
      staleResponse.status()
    ).toBe(409);

    expect(
      staleBody
    ).toHaveProperty('error');

    expect(
      staleBody.error
    ).toBe(
      'Data baru saja berubah. Periksa kembali lalu simpan ulang.'
    );


    // Pastikan transaksi kedua benar-benar tidak tersimpan
    const verifyBody =
      await getApiState(request);

    const transaksiKeduaAda =
      verifyBody.state.entries.some(
        (entry: any) =>
          entry.description === testIdKedua
      );

    expect(
      transaksiKeduaAda
    ).toBe(false);

  } finally {

    await cleanupTestTransaction(
      testIdPertama
    );

    await cleanupTestTransaction(
      testIdKedua
    );

  }
  
}); // tutup test version

}); // tutup API RETNAM

test.describe('API RETNAM tanpa autentikasi', () => {

  test.use({
    storageState: {
      cookies: [],
      origins: [],
    },
  });

  test('GET data ditolak jika belum login', async ({ request }) => {

    const response = await request.get(
      'api/data.php'
    );

    console.log(
      'Status tanpa login:',
      response.status()
    );

    expect(response.status()).toBe(401);

    const body = await response.json();

    console.log(
      'Pesan:',
      body.error
    );

    expect(body).toHaveProperty('error');
    expect(body.signin).toBe(true);

  });

});