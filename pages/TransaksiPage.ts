import { Page, Locator, expect } from '@playwright/test';

export class TransaksiPage {
  readonly page: Page;

  readonly cariTransaksi: Locator;
  readonly nominal: Locator;
  readonly keterangan: Locator;
  readonly kategori: Locator;
  readonly headingUangMasuk: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cariTransaksi =
      page.getByLabel('Cari transaksi');

    this.nominal =
      page.getByLabel('Nominal (Rp)');

    this.keterangan =
      page.getByLabel('Keterangan / sumber dana');

    this.kategori =
      page.getByLabel('Kegiatan / kategori');

    this.headingUangMasuk =
      page.getByRole('heading', {
        name: 'Catat uang masuk'
      });
  }

  async bukaMenuTransaksi() {
    await this.page
      .getByRole('button', { name: 'Transaksi' })
      .click();

    await expect(this.cariTransaksi).toBeVisible();
  }

  async bukaFormUangMasuk() {
    await this.page
      .getByRole('button', { name: 'Uang masuk' })
      .click();

    await expect(
      this.headingUangMasuk
    ).toBeVisible();
  }

  async isiUangMasuk(
    nominal: string,
    keterangan: string,
    kategori: string
  ) {
    await this.nominal.fill(nominal);
    await this.keterangan.fill(keterangan);
    await this.kategori.fill(kategori);
  }

  async simpan() {
    await this.page
      .getByRole('button', { name: /simpan/i })
      .click();
  }

  async batal() {
    await this.page
      .getByRole('button', { name: 'Batal' })
      .click();
  }

  transaksiDenganKeterangan(text: string) {
    return this.page.getByText(text);
  }
}