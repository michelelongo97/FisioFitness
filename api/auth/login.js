import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
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
  const isChangePassword = req.query.action === "change-password";

  if (isChangePassword) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Non autenticato" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Dati mancanti" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "La nuova password deve avere almeno 6 caratteri" });
    }

    try {
      const { rows } =
        await sql`SELECT password_hash FROM users WHERE id = ${userId}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Utente non trovato" });
      }

      const valid = await bcrypt.compare(
        currentPassword,
        rows[0].password_hash,
      );
      if (!valid) {
        return res.status(401).json({ error: "Password attuale non corretta" });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${userId}`;

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Errore nel cambio password" });
    }
  }

  // --- LOGIN (comportamento originale invariato) ---
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e password obbligatorie" });
  }

  try {
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel login" });
  }
}
