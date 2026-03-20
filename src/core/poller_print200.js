const { pool } = require("../config/db");
const { sendToPrinter } = require("./printer");
const { buildZPLFromProcess } = require("../converters/label_process");

async function claimNextJob() {
  const sql = `
    SELECT *
    FROM public.tb_mes_print200
    WHERE status_yn IS NULL
      AND pg_try_advisory_lock(2, id)
    ORDER BY id
    LIMIT 1
  `;
  const { rows } = await pool.query(sql);
  return rows[0] || null;
}

async function setStatus(id, status) {
  await pool.query(
    `UPDATE public.tb_mes_print200
     SET status_yn = $1
     WHERE id = $2`,
    [status, id]
  );
}
async function markDone(id) {
  return setStatus(id, "Y");
}
async function markFail(id) {
  return setStatus(id, "N");
}

async function releaseAdvisoryLock(id) {
  try {
    await pool.query("SELECT pg_advisory_unlock(2, $1)", [id]);
  } catch {}
}

async function tickOnce200(env) {
  const job = await claimNextJob();
  if (!job) return false;

  try {
    const zpl = await buildZPLFromProcess(job, {
      x: 0,
      y: 0,
      width: 910,
      height: 700,
    });
    await sendToPrinter(zpl, env.PRINTER_HOST, env.PRINTER_PORT);
    await markDone(job.id);
    console.log(`[PRINT200 OK] id=${job.id}`);
  } catch (err) {
    await markFail(job.id);
    console.error(`[PRINT200 FAIL] id=${job.id} ::`, err?.message || err);
  } finally {
    await releaseAdvisoryLock(job.id);
  }
  return true;
}

module.exports = { tickOnce200 };
