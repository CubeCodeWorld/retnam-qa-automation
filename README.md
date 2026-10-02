# RETNAM QA Automation

Automation testing project untuk aplikasi RETNAM menggunakan Playwright dan TypeScript.

Project ini mencakup UI testing, API testing, authentication state, business logic validation, optimistic locking, serta database cleanup untuk menjaga data test tetap bersih.

## Tech Stack

- Playwright
- TypeScript
- Node.js
- MySQL
- dotenv
- mysql2

## Test Coverage

### Authentication
- Admin berhasil login
- Login gagal jika password salah
- Admin berhasil logout
- Reuse authentication state

### UI Transaction
- Membuka form uang masuk
- Mengisi form uang masuk
- Validasi nominal kosong
- Menyimpan transaksi uang masuk
- Memastikan saldo bertambah sesuai nominal transaksi

### API
- GET data sebagai admin → 200
- GET tanpa autentikasi → 401
- POST transaksi uang masuk → 200
- POST tanpa CSRF token → 403
- Validasi saldo setelah pemasukan
- Stale version / optimistic locking → 409

### Test Data Cleanup

Data automation menggunakan identifier khusus seperti:

- `QA-E2E-*`
- `QA-SALDO-*`
- `QA-API-*`

Data tersebut dibersihkan otomatis setelah test selesai sehingga tidak mengotori data aplikasi.

## Project Structure

```text
qa-automation/
├── auth/
│   └── admin.json
├── helpers/
│   ├── api.ts
│   ├── auth.ts
│   └── db.ts
├── pages/
│   ├── DashboardPage.ts
│   └── TransaksiPage.ts
├── tests/
│   ├── auth.setup.ts
│   ├── api.spec.ts
│   ├── login.spec.ts
│   └── transaksi.spec.ts
├── .env
├── .gitignore
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json

Copyright © 2026 CubeCodeWorld / VanJaya.
All rights reserved.