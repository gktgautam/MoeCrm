// backend/db/knex.engage.config.cjs
module.exports = function makeEngageKnexConfig(env) {
  return {
    client: "pg",
    connection: env.ENGAGE_DB_URL,
    pool: { min: 0, max: Number(env.KNEX_POOL_MAX ?? env.PG_POOL_MAX ?? 5) },
    migrations: {
      directory: __dirname + "/entity",
      tableName: "knex_migrations_engage",
    },
    seeds: {
      directory: __dirname + "/seeds",
    },
  };
};
