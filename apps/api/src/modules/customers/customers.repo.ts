import type { Pool } from "pg";

export async function fetchCustomersUpdatedAfter(
  dbCrm: Pool,
  orgId: number,
  updatedAfter?: string
) {
  if (updatedAfter) {
    const { rows } = await dbCrm.query(
      `select id as customer_id, org_id, email, name, phone, city, plan, updated_at
       from customers
       where org_id = $1 and updated_at > $2
       order by updated_at asc
       limit 5000`,
      [orgId, new Date(updatedAfter)]
    );
    return rows;
  }

  const { rows } = await dbCrm.query(
    `select id as customer_id, org_id, email, name, phone, city, plan, updated_at
     from customers
     where org_id = $1
     order by updated_at asc
     limit 5000`,
    [orgId]
  );
  return rows;
}

export async function upsertCustomerSnapshots(dbEngage: Pool, rows: any[]) {
  if (!rows.length) return 0;

  // bulk upsert
  const values: any[] = [];
  const placeholders: string[] = [];

  rows.forEach((r, i) => {
    const idx = i * 4;
    placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}::jsonb, $${idx + 4})`);
    values.push(
      Number(r.org_id),
      Number(r.customer_id),
      JSON.stringify({
        email: r.email,
        name: r.name,
        phone: r.phone,
        city: r.city,
        plan: r.plan,
      }),
      new Date(r.updated_at ?? new Date())
    );
  });

  const sql = `
    insert into customer_snapshot (org_id, customer_id, attrs, updated_at)
    values ${placeholders.join(",")}
    on conflict (org_id, customer_id)
    do update set
      attrs = excluded.attrs,
      updated_at = excluded.updated_at
  `;

  await dbEngage.query(sql, values);
  return rows.length;
}
