import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rows } = await sql`
      SELECT s.id, s.date, s.time
      FROM slots s
      WHERE s.is_active = true 
        AND s.date >= CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM bookings b 
          WHERE b.slot_id = s.id AND b.status = 'confirmed'
        )
      ORDER BY s.date, s.time
    `;
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero degli slot" });
  }
}
