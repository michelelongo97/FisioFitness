import { sql } from "@vercel/postgres";

function checkAuth(req, res) {
  if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Non autorizzato" });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;

  if (req.method === "GET") {
    const { rows } = await sql`
  SELECT b.id, b.status, to_char(s.date, 'YYYY-MM-DD') as date, s.time, u.name, u.email
  FROM bookings b
  JOIN slots s ON b.slot_id = s.id
  JOIN users u ON b.user_id = u.id
  ORDER BY s.date DESC, s.time DESC
`;
    return res.status(200).json(rows);
  }

  // PATCH — segna presente/assente
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { status } = req.body; // 'attended' | 'absent'

    if (!["attended", "absent", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Status non valido" });
    }

    await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
