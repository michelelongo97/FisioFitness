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
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Non autenticato" });

  if (req.method === "GET") {
    const { rows } = await sql`
      SELECT b.id, b.status, s.date, s.time
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.user_id = ${userId}
      ORDER BY s.date DESC, s.time DESC
    `;
    return res.status(200).json(rows);
  }

  // PATCH — cancella una prenotazione (solo se nel futuro)
  if (req.method === "PATCH") {
    const { id } = req.query;

    const { rows } = await sql`
      SELECT b.*, s.date, s.time
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.id = ${id} AND b.user_id = ${userId}
    `;
    if (rows.length === 0)
      return res.status(404).json({ error: "Prenotazione non trovata" });

    const booking = rows[0];
    const slotDateTime = new Date(`${booking.date}T${booking.time}`);
    if (slotDateTime < new Date()) {
      return res
        .status(400)
        .json({ error: "Non puoi cancellare uno slot già passato" });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: "Prenotazione già cancellata" });
    }

    await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${id}`;
    await sql`
      UPDATE subscriptions SET used_entries = used_entries - 1 
      WHERE id = ${booking.subscription_id}
    `;

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
