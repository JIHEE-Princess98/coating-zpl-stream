require("dotenv").config();
const { Pool } = require("pg");

const { DATABASE_URL, PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } =
  process.env;

const pool = new Pool(
  DATABASE_URL
    ? { connectionString: DATABASE_URL }
    : {
        host: PGHOST,
        port: Number(PGPORT || 5432),
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
      }
);

pool.on("error", (err) => console.error("[PG POOL ERROR]", err));

module.exports = { pool };
