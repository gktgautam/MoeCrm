module.exports = {
  client: "pg",
  connection: process.env.ENGAGE_DB_URL,
  pool: {
    min: 0,
    max: Number(process.env.PG_POOL_MAX ?? 5),
  },
  migrations: {
    directory: "./engage/migrations",
    tableName: "knex_migrations_engage",
  },
  seeds: {
    directory: "./engage/seeds",
  },
};
