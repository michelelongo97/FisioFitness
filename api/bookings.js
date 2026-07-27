import { sql } from "@vercel/postgres";
import jwt from "jsonwebtoken";

function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET,
    );
    return decoded.userId;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = getUserId(req);
  if (!userId)
    return res.status(401).json({ error: "Devi accedere per prenotare" });

  const { slotId } = req.body;
  if (!slotId) return res.status(400).json({ error: "Slot mancante" });

  try {
    // Verifica abbonamento attivo con ingressi disponibili
    const { rows: subRows } = await sql`
      SELECT * FROM subscriptions
      WHERE user_id = ${userId} AND expires_at >= CURRENT_DATE
      ORDER BY expires_at DESC LIMIT 1
    `;
    if (subRows.length === 0) {
      return res.status(403).json({ error: "Nessun abbonamento attivo" });
    }
    const subscription = subRows[0];
    if (subscription.used_entries >= subscription.total_entries) {
      return res.status(403).json({ error: "Ingressi esauriti" });
    }

    // Verifica capienza slot
    const { rows: slotRows } = await sql`
  SELECT s.max_bookings,
    (SELECT COUNT(*) FROM bookings b 
     WHERE b.slot_id = s.id AND b.status = 'confirmed') as booked_count
  FROM slots s WHERE s.id = ${slotId}
`;
    if (slotRows.length === 0) {
      return res.status(404).json({ error: "Slot non trovato" });
    }
    if (parseInt(slotRows[0].booked_count) >= slotRows[0].max_bookings) {
      return res.status(409).json({ error: "Slot al completo" });
    }

    // Crea la prenotazione e scala l'ingresso
    const { rows } = await sql`
      INSERT INTO bookings (user_id, slot_id, subscription_id, status)
      VALUES (${userId}, ${slotId}, ${subscription.id}, 'confirmed')
      RETURNING *
    `;
    await sql`
      UPDATE subscriptions SET used_entries = used_entries + 1 
      WHERE id = ${subscription.id}
    `;

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella prenotazione" });
  }
}
