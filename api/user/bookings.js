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

  const isLifts = req.query.resource === "lifts";

  if (isLifts) {
    if (req.method === "GET") {
      const { rows } = await sql`
      SELECT id, exercise_key, weight, reps, to_char(recorded_at, 'YYYY-MM-DD') as recorded_at
      FROM max_lifts
      WHERE user_id = ${userId}
      ORDER BY recorded_at DESC, created_at DESC
    `;
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { exercise_key, weight, reps } = req.body;
      if (!exercise_key || weight === undefined || reps === undefined) {
        return res.status(400).json({ error: "Dati mancanti" });
      }
      const { rows } = await sql`
        INSERT INTO max_lifts (user_id, exercise_key, weight, reps)
        VALUES (${userId}, ${exercise_key}, ${weight}, ${reps})
        RETURNING id, exercise_key, weight, reps, to_char(recorded_at, 'YYYY-MM-DD') as recorded_at
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await sql`DELETE FROM max_lifts WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  }

  // --- BOOKINGS (comportamento originale invariato) ---
  if (req.method === "GET") {
    const { rows } = await sql`
    SELECT b.id, b.status, to_char(s.date, 'YYYY-MM-DD') as date, s.time, s.type
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
      SELECT b.*, to_char(s.date, 'YYYY-MM-DD') as date, s.time, s.type
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.id = ${id} AND b.user_id = ${userId}
    `;
    if (rows.length === 0)
      return res.status(404).json({ error: "Prenotazione non trovata" });

    const booking = rows[0];
    const slotDateTime = new Date(`${booking.date}T${booking.time}`);
    const minutesUntilSlot = (slotDateTime - new Date()) / 60000;
    if (minutesUntilSlot < 15) {
      return res
        .status(400)
        .json({
          error:
            "Non puoi cancellare a meno di 15 minuti dall'inizio della seduta",
        });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: "Prenotazione già cancellata" });
    }

    await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${id}`;
    await sql`
  UPDATE subscriptions SET used_entries = used_entries - 1 
  WHERE id = ${booking.subscription_id}
`;

    // Notifica email al dottore
    try {
      const { rows: userRows } =
        await sql`SELECT name, email FROM users WHERE id = ${userId}`;
      if (userRows.length > 0) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const user = userRows[0];
        const dateFormatted = new Date(booking.date).toLocaleDateString(
          "it-IT",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
          },
        );
        const timeFormatted = booking.time.slice(0, 5);

        await resend.emails.send({
          from: "FisioFitness <noreply@costafisiofitness.it>",
          to: process.env.VITE_EMAIL_RESEND,
          subject: `Cancellazione${booking.type === "course" ? " [Corso]" : ""}: ${dateFormatted}, ${timeFormatted} | ${user.name}`,
          html: `
        <p>Prenotazione cancellata:</p>
        <ul>
          <li><strong>Cliente:</strong> ${user.name}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Data:</strong> ${dateFormatted}</li>
          <li><strong>Ora:</strong> ${timeFormatted}</li>
        </ul>
      `,
        });
      }
    } catch (emailErr) {
      console.error("Errore invio email notifica cancellazione:", emailErr);
    }

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
