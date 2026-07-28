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
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    // Totale generale (esclude cancellate)
    const { rows: totalRows } = await sql`
      SELECT COUNT(*) as total
      FROM bookings b
      WHERE b.status != 'cancelled'
    `;

    // Breakdown per mese (esclude cancellate)
    const { rows: monthlyRows } = await sql`
      SELECT 
        to_char(s.date, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.status != 'cancelled'
      GROUP BY to_char(s.date, 'YYYY-MM')
      ORDER BY month DESC
    `;

    res.status(200).json({
      total: parseInt(totalRows[0].total),
      monthly: monthlyRows.map((r) => ({
        month: r.month,
        count: parseInt(r.count),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero statistiche" });
  }
}
