import type { Pool } from "pg";

export type CrmCustomerRow = {
  customer_id: number;
  email: string | null;
  name: string | null;
  phone: string | null;
  city: string | null;
  plan: string | null;
  updated_at: Date;
};

export async function fetchCustomersUpdatedAfter(dbCrm: Pool, updatedAfter?: string) {
  const hasUpdatedAfter = Boolean(updatedAfter);
  const query = `
    select
      id as customer_id,
      email,
      name,
      phone,
      city,
      plan,
      updated_at
    from customers
    ${hasUpdatedAfter ? "where updated_at > $1" : ""}
    order by updated_at asc
    limit 5000
  `;

  const values = hasUpdatedAfter ? [new Date(updatedAfter as string)] : [];
  const { rows } = await dbCrm.query<CrmCustomerRow>(query, values);
  return rows;
}

export async function upsertContactsFromCrm(dbEngage: Pool, rows: CrmCustomerRow[]) {
  if (rows.length === 0) return 0;

  const values: Array<number | string | Date | null> = [];
  const placeholders: string[] = [];

  rows.forEach((row, index) => {
    const offset = index * 8;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`,
    );

    values.push(1, row.customer_id, row.email, row.phone, row.name, row.city, row.plan, row.updated_at ?? new Date());
  });

  const sql = `
    insert into contacts
      (org_id, crm_customer_id, email, phone, first_name, city, plan, last_synced_at)
    values ${placeholders.join(",")}
    on conflict (org_id, crm_customer_id)
    do update set
      email = excluded.email,
      phone = excluded.phone,
      first_name = excluded.first_name,
      city = excluded.city,
      plan = excluded.plan,
      last_synced_at = excluded.last_synced_at,
      updated_at = now()
  `;

  await dbEngage.query(sql, values);
  return rows.length;
}
