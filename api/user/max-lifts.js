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

  res.status(405).json({ error: "Method not allowed" });
}
