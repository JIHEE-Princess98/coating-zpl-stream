const { pool } = require("../config/db");
const { sendToPrinter } = require("./printer");
const { buildZPLFromDelivery } = require("../converters/label_delivery");

async function claimNextJob() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const sel = await client.query(`
      SELECT *
      FROM public.tb_mes_print100
      WHERE status_yn IS NULL
      ORDER BY id
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `);

    if (sel.rowCount === 0) {
      await client.query("ROLLBACK");
      client.release();
      return null;
    }

    const job = sel.rows[0];

    await client.query(
      `UPDATE public.tb_mes_print100
       SET status_yn = 'W'
       WHERE id = $1`,
      [job.id]
    );

    await client.query("COMMIT");
    client.release();
    return job;
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    client.release();
    throw e;
  }
}

async function setStatus(id, status) {
  await pool.query(
    `UPDATE public.tb_mes_print100
     SET status_yn = $1
     WHERE id = $2`,
    [status, id]
  );
}
const markDone = (id) => setStatus(id, "Y");
const markFail = (id) => setStatus(id, "N");

async function tickOnce100(env) {
  const job = await claimNextJob();
  if (!job) return false;

  try {
    const zpl = await buildZPLFromDelivery(job, {
      x: 0,
      y: 0,
      width: 780,
    });
    await sendToPrinter(zpl, env.PRINTER_HOST, env.PRINTER_PORT);
    await markDone(job.id);
    console.log(`[PRINT100 OK] id=${job.id}`);
  } catch (err) {
    await markFail(job.id);
    console.error(`[PRINT100 FAIL] id=${job.id} ::`, err?.stack || err);
  }
  return true;
}

module.exports = { tickOnce100 };
