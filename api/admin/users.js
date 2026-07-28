import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

function checkAuth(req, res) {
  if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Non autorizzato" });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;

  // GET — lista utenti con stato abbonamento
  if (req.method === "GET") {
    const currentYear = new Date().getFullYear();

    const { rows } = await sql`
    SELECT 
      u.id, u.name, u.email, u.created_at,
      s.id as subscription_id, s.total_entries, s.used_entries, 
      s.starts_at, s.expires_at,
      (
        SELECT COUNT(*) FROM bookings b
        WHERE b.user_id = u.id AND b.status IN ('attended', 'absent')
      ) as total_sessions,
      (
        SELECT COUNT(*) FROM bookings b
        JOIN slots sl ON b.slot_id = sl.id
        WHERE b.user_id = u.id AND b.status IN ('attended', 'absent')
          AND EXTRACT(YEAR FROM sl.date) = ${currentYear}
      ) as sessions_this_year
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id 
      AND s.expires_at = (
        SELECT MAX(expires_at) FROM subscriptions WHERE user_id = u.id
      )
    ORDER BY u.created_at DESC
  `;
    return res.status(200).json(rows);
  }

  // POST — crea utente + abbonamento in un colpo solo
  if (req.method === "POST") {
    const { name, email, password, total_entries, starts_at } = req.body;

    if (!name || !email || !password || !total_entries || !starts_at) {
      return res.status(400).json({ error: "Dati mancanti" });
    }

    try {
      const password_hash = await bcrypt.hash(password, 10);

      const { rows: userRows } = await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${name}, ${email}, ${password_hash})
        RETURNING id, name, email, created_at
      `;
      const user = userRows[0];

      // scadenza a +3 mesi dalla data di inizio
      const { rows: subRows } = await sql`
        INSERT INTO subscriptions (user_id, total_entries, starts_at, expires_at)
        VALUES (
          ${user.id}, ${total_entries}, ${starts_at}, 
          (${starts_at}::date + INTERVAL '3 months')
        )
        RETURNING *
      `;

      res.status(201).json({ user, subscription: subRows[0] });
    } catch (err) {
      if (err.code === "23505") {
        // email duplicata
        return res.status(409).json({ error: "Email già registrata" });
      }
      console.error(err);
      res.status(500).json({ error: "Errore nella creazione utente" });
    }
  }
}
