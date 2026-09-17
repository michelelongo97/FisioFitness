import { sql } from "@vercel/postgres";

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

  if (req.method === "GET") {
    const { rows } = await sql`SELECT * FROM reels ORDER BY created_at DESC`;
    res.setHeader("X-Admin-Role", role);
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { url, caption } = req.body;
    if (!url) return res.status(400).json({ error: "URL obbligatorio" });

    const normalized = url.trim().replace(/\/?$/, "/");

    const { rows } = await sql`
      INSERT INTO reels (url, caption)
      VALUES (${normalized}, ${caption || null})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await sql`UPDATE reels SET is_active = false WHERE id = ${id}`;
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
