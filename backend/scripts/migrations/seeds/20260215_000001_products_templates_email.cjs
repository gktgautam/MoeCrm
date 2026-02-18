 

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("email_senders").del();

  // Inserts seed entries
  await knex("email_senders").insert([
    {
      id: 1,
      name: "Support Team",
      from_email: "support@example.com",
      reply_to_email: "helpdesk@example.com",
      is_verified: true,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: 2,
      name: "Marketing",
      from_email: "marketing@example.com",
      reply_to_email: null,
      is_verified: false,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: 3,
      name: "No-Reply",
      from_email: "no-reply@example.com",
      reply_to_email: null,
      is_verified: true,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
};
