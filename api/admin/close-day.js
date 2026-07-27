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
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Data obbligatoria" });

  try {
    // Trova tutte le prenotazioni confermate sugli slot di quel giorno
    const { rows: bookingsToCancel } = await sql`
      SELECT b.id, b.subscription_id
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE s.date = ${date} AND b.status = 'confirmed'
    `;

    // Cancella le prenotazioni e ripristina gli ingressi
    for (const booking of bookingsToCancel) {
      await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${booking.id}`;
      await sql`
        UPDATE subscriptions SET used_entries = used_entries - 1 
        WHERE id = ${booking.subscription_id}
      `;
    }

    // Disattiva tutti gli slot di quel giorno
    await sql`UPDATE slots SET is_active = false WHERE date = ${date}`;

    res.status(200).json({
      success: true,
      cancelledBookings: bookingsToCancel.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella chiusura del giorno" });
  }
}
