import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

/**
 * Minimal interface implemented by both Pool and PoolClient.
 * (Avoids union-overload issues on .query)
 */
export type QueryParams = readonly unknown[];

export interface Queryable {
  query<T extends QueryResultRow = any>(text: string, params?: QueryParams): Promise<QueryResult<T>>;
}

/**
 * Transaction helper
 */
export async function withTx<T>(pool: Pool, fn: (tx: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err: unknown) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore rollback errors */
    }
    throw err;
  } finally {
    client.release();
  }
}

/** returns row or null */
export async function oneOrNone<T extends QueryResultRow = any>(
  db: Queryable,
  text: string,
  params: QueryParams = []
): Promise<T | null> {
  const res = await db.query<T>(text, params);
  return res.rows[0] ?? null;
}

/** returns row or throws */
export async function one<T extends QueryResultRow = any>(
  db: Queryable,
  text: string,
  params: QueryParams = []
): Promise<T> {
  const res = await db.query<T>(text, params);
  const row = res.rows[0];
  if (!row) throw new Error("Expected 1 row, got 0");
  return row;
}

/** returns rows[] */
export async function many<T extends QueryResultRow = any>(
  db: Queryable,
  text: string,
  params: QueryParams = []
): Promise<T[]> {
  const res = await db.query<T>(text, params);
  return res.rows;
}

export async function exec(db: Queryable, text: string, params: QueryParams = []): Promise<number> {
  const res = await db.query(text, params);
  return res.rowCount ?? 0;
}

export async function none(db: Queryable, text: string, params: QueryParams = []): Promise<void> {
  await db.query(text, params);
}

/**
 * Binder: bind helpers to a Pool once so you don't pass db each time.
 */
export function bindDb(pool: Pool) {
  return {
     oneOrNone: <T extends QueryResultRow = any>(text: string, params: QueryParams = []) => oneOrNone<T>(pool, text, params),
     one: <T extends QueryResultRow = any>(text: string, params: QueryParams = []) => one<T>(pool, text, params),
     many: <T extends QueryResultRow = any>(text: string, params: QueryParams = []) => many<T>(pool, text, params),
     exec: (text: string, params: QueryParams = []) => exec(pool, text, params),
     none: (text: string, params: QueryParams = []) => none(pool, text, params),
     withTx: <T>(fn: (tx: PoolClient) => Promise<T>) => withTx(pool, fn),
 
     // tx-bound helpers (nice inside transactions)
    tx: (tx: PoolClient) => ({
       oneOrNone: <T extends QueryResultRow = any>(text: string, params: QueryParams = []) => oneOrNone<T>(tx, text, params),
       one: <T extends QueryResultRow = any>(text: string, params: QueryParams = []) => one<T>(tx, text, params),
       many: <T extends QueryResultRow = any>(text: string, params: QueryParams = []) => many<T>(tx, text, params),
       exec: (text: string, params: QueryParams = []) => exec(tx, text, params),
       none: (text: string, params: QueryParams = []) => none(tx, text, params),
    }),
  };
}
