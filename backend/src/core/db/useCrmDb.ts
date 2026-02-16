import type { FastifyRequest } from "fastify";
import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

type DbConn = Pool | PoolClient;

function isClient(conn: DbConn): conn is PoolClient {
  return typeof (conn as PoolClient).release === "function";
}

export type CrmDb = {
  query: <T extends QueryResultRow = any>(
    text: string,
    params?: readonly unknown[]
  ) => Promise<QueryResult<T>>;

  tx: <T>(fn: (db: CrmDb) => Promise<T>) => Promise<T>;
};

export function useCrmDb(req: FastifyRequest): CrmDb {
  const base: DbConn = req.server.dbCrm;

  const create = (conn: DbConn): CrmDb => {
    const query: CrmDb["query"] = (text, params = []) =>
      conn.query(text, params as any[]);

    const tx: CrmDb["tx"] = async (fn) => {
      if (isClient(conn)) return fn(create(conn));

      const client = await (conn as Pool).connect();
      try {
        await client.query("BEGIN");
        const result = await fn(create(client));
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    };

    return { query, tx };
  };

  return create(base);
}
