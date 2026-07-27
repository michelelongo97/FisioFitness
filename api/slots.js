import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rows } = await sql`
      SELECT s.id, to_char(s.date, 'YYYY-MM-DD') as date, s.time, 
        s.max_bookings,
        (SELECT COUNT(*) FROM bookings b 
         WHERE b.slot_id = s.id AND b.status = 'confirmed') as booked_count
      FROM slots s
      WHERE s.is_active = true 
        AND s.date >= CURRENT_DATE
      HAVING (SELECT COUNT(*) FROM bookings b 
              WHERE b.slot_id = s.id AND b.status = 'confirmed') < s.max_bookings
      ORDER BY s.date, s.time
    `;
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero degli slot" });
  }
}
