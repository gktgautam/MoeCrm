module.exports = {
  client: "pg",
  connection: process.env.ENGAGE_DB_URL,
  pool: {
    min: 0,
    max: Number(process.env.PG_POOL_MAX ?? 5),
  },
  migrations: {
    directory: "./src/db/migrations/engage",
    tableName: "knex_migrations_engage"
  },
  seeds: {
    directory: "./src/db/seeds/engage",
  },
};
