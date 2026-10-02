import mysql from 'mysql2/promise';

export async function cleanupTestTransaction(
  testId: string
) {
  // Safety guard:
  // jangan sampai helper ini menghapus transaksi asli.
  if (
  !testId.startsWith('QA-E2E-') &&
  !testId.startsWith('QA-SALDO-') &&
  !testId.startsWith('QA-API-')
) {
  throw new Error(
    `Cleanup ditolak karena bukan data QA: ${testId}`
  );
}

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute<mysql.ResultSetHeader>(
      `
      DELETE FROM entries
      WHERE description = ?
        AND kind = 'income'
        AND category = 'QA Automation'
      LIMIT 1
      `,
      [testId]
    );

    if (result.affectedRows > 0) {
      await connection.execute(
        'UPDATE app_meta SET version = version + 1 WHERE id = 1'
      );

      console.log(`Cleanup berhasil: ${testId}`);
    }

    await connection.commit();

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    await connection.end();

  }
}