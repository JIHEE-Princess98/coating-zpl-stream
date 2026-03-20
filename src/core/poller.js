const { pool } = require("../config/db");
const { sendToPrinter } = require("./printer");
const { buildZPLFromHTML } = require("../converters/label_html_image");

async function claimNextJob() {
  const sql = `
    SELECT *
    FROM public.tb_mes_print000
    WHERE status_yn IS NULL
      AND pg_try_advisory_lock(0, id)
    ORDER BY id
    LIMIT 1
  `;
  const { rows } = await pool.query(sql);
  return rows[0] || null;
}

async function setStatus(id, status) {
  await pool.query(
    `UPDATE public.tb_mes_print000
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
    await pool.query("SELECT pg_advisory_unlock(0, $1)", [id]);
  } catch {}
}

async function tickOnce(env) {
  const job = await claimNextJob();
  if (!job) return false;

  try {
    const zpl = await buildZPLFromHTML(job, { x: 0, y: 0, width: 780 });
    await sendToPrinter(zpl, env.PRINTER_HOST, env.PRINTER_PORT);
    await markDone(job.id);
    console.log(`[PRINT OK] id=${job.id}`);
  } catch (err) {
    await markFail(job.id);
    console.error(
      `[PRINT FAIL] id=${job.id} ::`,
      err && err.message ? err.message : err
    );
  } finally {
    await releaseAdvisoryLock(job.id);
  }
  return true;
}

module.exports = { tickOnce };
