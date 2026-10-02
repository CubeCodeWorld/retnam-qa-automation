import { APIRequestContext } from '@playwright/test';

export function tanggalHariIniWIB(): string {
  return new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).format(new Date());
}


export async function getApiState(
  request: APIRequestContext
) {
  const response = await request.get(
    'api/data.php'
  );

  if (response.status() !== 200) {
    throw new Error(
      `GET API gagal. Status: ${response.status()}`
    );
  }

  return await response.json();
}


type PostIncomeOptions = {
  csrf: string;
  version: number;
  amount: number;
  description: string;
  category?: string;
  date?: string;
};


export async function postIncome(
  request: APIRequestContext,
  options: PostIncomeOptions
) {
  return await request.post(
    'api/data.php',
    {
      data: {
        action: 'income',
        amount: options.amount,
        date:
          options.date ??
          tanggalHariIniWIB(),
        description: options.description,
        category:
          options.category ??
          'QA Automation',
        version: options.version,
      },

      headers: {
        'X-CSRF-Token': options.csrf,
      },
    }
  );
}


export function hitungSaldo(
  entries: any[]
): number {
  return entries.reduce(
    (total, entry) =>
      total + Number(entry.cash),
    0
  );
}