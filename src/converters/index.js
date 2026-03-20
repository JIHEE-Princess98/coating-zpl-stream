require("dotenv").config();
const { tickOnce } = require("../core/poller");
const { tickOnce100 } = require("../core/poller_print100");
const { tickOnce200 } = require("../core/poller_print200");

const {
  PGHOST,
  PGDATABASE,
  PGUSER,
  PRINTER_HOST,
  PRINTER_PORT,
  POLL_INTERVAL_MS,
} = process.env;

console.log("[BSI-PRINT] starting...");
console.log(
  " DB =",
  process.env.DATABASE_URL ||
    `${PGUSER || ""}@${PGHOST || ""}/${PGDATABASE || ""}`
);
console.log(" PRINTER =", `${PRINTER_HOST}:${PRINTER_PORT}`);
console.log(" INTERVAL =", POLL_INTERVAL_MS, "ms");

let running = false;
let backoff = Number(POLL_INTERVAL_MS || "2000");

async function loop() {
  if (running) return;
  running = true;
  try {
    const worked000 = await tickOnce(process.env);
    const worked100 = await tickOnce100(process.env);
    const worked200 = await tickOnce200(process.env);
    const worked = worked000 || worked100 || worked200;
    backoff = worked ? Number(POLL_INTERVAL_MS || "2000") : backoff;
  } catch (e) {
    console.error("[LOOP ERROR]", e);
    backoff = Math.min(Math.floor(backoff * 1.5), 30000);
  } finally {
    running = false;
    setTimeout(loop, backoff);
  }
}

loop();
