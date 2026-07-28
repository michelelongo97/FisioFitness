import { sql } from "@vercel/postgres";

function checkAuth(req, res) {
  if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Non autorizzato" });
    return false;
  }
  return true;
}

const WEEKDAY_TIMES = [
  "09:00:00",
  "09:45:00",
  "10:30:00",
  "11:15:00",
  "12:00:00",
  "13:30:00",
  "14:15:00",
  "15:00:00",
  "15:45:00",
  "16:30:00",
  "17:15:00",
  "18:00:00",
  "18:45:00",
  "19:30:00",
];

const SATURDAY_TIMES = [
  "09:00:00",
  "09:45:00",
  "10:30:00",
  "11:15:00",
  "12:00:00",
];

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const today = new Date();
    const slotsToInsert = [];

    // 4 settimane = 28 giorni
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0 = domenica, 6 = sabato

      if (dayOfWeek === 0) continue; // domenica chiuso

      const dateStr = date.toISOString().slice(0, 10);
      const times = dayOfWeek === 6 ? SATURDAY_TIMES : WEEKDAY_TIMES;

      for (const time of times) {
        slotsToInsert.push({ date: dateStr, time });
      }
    }

    let created = 0;
    let skipped = 0;

    for (const slot of slotsToInsert) {
      try {
        await sql`
          INSERT INTO slots (date, time, max_bookings)
          VALUES (${slot.date}, ${slot.time}, 4)
        `;
        created++;
      } catch (err) {
        if (err.code === "23505") {
          skipped++;
        } else {
          throw err;
        }
      }
    }

    res.status(200).json({ success: true, created, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella generazione degli slot" });
  }
}
