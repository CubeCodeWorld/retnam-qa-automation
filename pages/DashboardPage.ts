import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async pastikanTerbuka() {
    await expect(
      this.page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();
  }

  async bukaDashboard() {
    await this.page
      .getByRole('button', { name: 'Dashboard' })
      .click();

    await this.pastikanTerbuka();
  }

  async ambilSaldo(): Promise<number> {
    const saldoText = await this.page
      .locator('strong')
      .filter({ hasText: /^Rp\s?[\d.]+$/ })
      .first()
      .innerText();

    return Number(
      saldoText.replace(/[^\d]/g, '')
    );
  }
}