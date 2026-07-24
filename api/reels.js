import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rows } = await sql`
      SELECT * FROM reels
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dei reel" });
  }
}
