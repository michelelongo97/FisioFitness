import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

function checkAuth(req, res) {
  const pwd = req.headers["x-admin-password"];
  if (pwd === process.env.ADMIN_PASSWORD) return "full";
  if (pwd === process.env.ADMIN_READONLY_PASSWORD) return "readonly";
  res.status(401).json({ error: "Non autorizzato" });
  return null;
}

export default async function handler(req, res) {
  const role = checkAuth(req, res);
  if (!role) return;

  if (role === "readonly" && req.method !== "GET") {
    return res.status(403).json({ error: "Accesso in sola lettura" });
  }

  // --- PARAMETRI CORPOREI (bilancia BIA) ---
  if (req.query.resource === "body-params") {
    if (req.method === "GET") {
      const { userId } = req.query;
      if (!userId)
        return res.status(400).json({ error: "userId obbligatorio" });
      const { rows } = await sql`
  SELECT id, weight_kg, body_fat_percent, body_water_percent, muscle_mass_kg, waist_cm, chest_cm,
    to_char(recorded_at, 'YYYY-MM-DD') as recorded_at
  FROM body_parameters
  WHERE user_id = ${userId}
  ORDER BY recorded_at DESC, created_at DESC
`;
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const {
        userId,
        weight_kg,
        body_fat_percent,
        body_water_percent,
        muscle_mass_kg,
        waist_cm,
        chest_cm,
        recorded_at,
      } = req.body;
      if (!userId)
        return res.status(400).json({ error: "userId obbligatorio" });

      try {
        const { rows } = await sql`
      INSERT INTO body_parameters (user_id, weight_kg, body_fat_percent, body_water_percent, muscle_mass_kg, waist_cm, chest_cm, recorded_at)
      VALUES (${userId}, ${weight_kg || null}, ${body_fat_percent || null}, ${body_water_percent || null}, ${muscle_mass_kg || null}, ${waist_cm || null}, ${chest_cm || null}, ${recorded_at || new Date().toISOString().slice(0, 10)})
      RETURNING id, weight_kg, body_fat_percent, body_water_percent, muscle_mass_kg, waist_cm, chest_cm, to_char(recorded_at, 'YYYY-MM-DD') as recorded_at
    `;
        return res.status(201).json(rows[0]);
      } catch (err) {
        console.error("Errore inserimento parametri corporei:", err);
        if (err.code === "22003") {
          return res
            .status(400)
            .json({
              error:
                "Uno dei valori inseriti è fuori scala, ricontrolla i numeri",
            });
        }
        return res
          .status(500)
          .json({ error: "Errore nel salvataggio della misurazione" });
      }
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await sql`DELETE FROM body_parameters WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  }

  // GET — lista utenti con stato abbonamento
  if (req.method === "GET") {
    const currentYear = new Date().getFullYear();

    const { rows } = await sql`
    SELECT 
      u.id, u.name, u.email, u.created_at, u.is_active,
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
    WHERE u.is_active = true
    ORDER BY u.created_at DESC
  `;

    if (role === "readonly") {
      const filtered = rows.map((u) => ({
        id: u.id,
        name: u.name,
      }));
      return res.status(200).json(filtered);
    }

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
  // PATCH — modifica ingressi o disattiva user
  if (req.method === "PATCH") {
    const { id } = req.query;
    const { action, total_entries, used_entries } = req.body;

    if (action === "update_entries") {
      const { expires_at } = req.body;
      if (
        total_entries === undefined ||
        used_entries === undefined ||
        !expires_at
      ) {
        return res.status(400).json({ error: "Dati mancanti" });
      }
      await sql`
    UPDATE subscriptions 
    SET total_entries = ${total_entries}, used_entries = ${used_entries}, expires_at = ${expires_at}
    WHERE user_id = ${id} 
      AND expires_at = (SELECT MAX(expires_at) FROM subscriptions WHERE user_id = ${id})
  `;
      return res.status(200).json({ success: true });
    }

    if (action === "deactivate") {
      await sql`UPDATE users SET is_active = false WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Azione non valida" });
  }
}
