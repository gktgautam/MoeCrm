import type { Pool } from "pg";
import { fetchCustomersUpdatedAfter, upsertContactsFromCrm } from "./customers.repository.js";

export type SyncCustomersParams = {
  dbCrm: Pool;
  dbEngage: Pool;
  orgId: number;
  updatedAfter?: string;
};

export type SyncCustomersResult = {
  fetched: number;
  upserted: number;
};

export async function syncCustomersFromCrm(params: SyncCustomersParams): Promise<SyncCustomersResult> {
  const rows = await fetchCustomersUpdatedAfter(params.dbCrm, params.orgId, params.updatedAfter);
  const upserted = await upsertContactsFromCrm(params.dbEngage, rows);

  return {
    fetched: rows.length,
    upserted,
  };
}
