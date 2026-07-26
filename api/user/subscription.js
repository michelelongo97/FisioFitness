import { sql } from "@vercel/postgres";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token mancante" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await sql`
      SELECT * FROM subscriptions
      WHERE user_id = ${decoded.userId}
      ORDER BY expires_at DESC
      LIMIT 1
    `;

    res.status(200).json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Token non valido" });
  }
}
