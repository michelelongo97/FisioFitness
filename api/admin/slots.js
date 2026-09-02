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
    SELECT s.id, to_char(s.date, 'YYYY-MM-DD') as date, s.time, s.is_active, s.max_bookings, s.type,
      (SELECT COUNT(*) FROM bookings b 
       WHERE b.slot_id = s.id AND b.status = 'confirmed') as booked_count
    FROM slots s
    ORDER BY s.date DESC, s.time DESC
  `;
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { date, time, type } = req.body;
    if (!date || !time)
      return res.status(400).json({ error: "date e time obbligatori" });

    const slotType = type === "course" ? "course" : "normal";

    try {
      const { rows } = await sql`
      INSERT INTO slots (date, time, max_bookings, type)
      VALUES (${date}, ${time}, 4, ${slotType})
      RETURNING *
    `;
      return res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res
          .status(409)
          .json({ error: "Slot già esistente per questa data/ora" });
      }
      return res.status(500).json({ error: "Errore nella creazione slot" });
    }
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await sql`UPDATE slots SET is_active = false WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
