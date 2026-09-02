import { sql } from "@vercel/postgres";

function checkAuth(req, res) {
  if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Non autorizzato" });
    return false;
  }
  return true;
}

const WEEKDAY_TIMES = [
  "08:15:00",
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

// Corso: lunedì(1), martedì(2), giovedì(4), venerdì(5)
const COURSE_DAYS = [1, 2, 4, 5];
const COURSE_TIMES = ["08:30:00", "17:30:00", "18:30:00"];

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const isCourse = req.query.type === "course";

  try {
    const today = new Date();
    const slotsToInsert = [];

    // 4 settimane = 28 giorni
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0 = domenica, 6 = sabato
      const dateStr = date.toISOString().slice(0, 10);

      if (isCourse) {
        if (!COURSE_DAYS.includes(dayOfWeek)) continue;
        for (const time of COURSE_TIMES) {
          slotsToInsert.push({ date: dateStr, time });
        }
      } else {
        if (dayOfWeek === 0) continue; // domenica chiuso
        const times = dayOfWeek === 6 ? SATURDAY_TIMES : WEEKDAY_TIMES;
        for (const time of times) {
          slotsToInsert.push({ date: dateStr, time });
        }
      }
    }

    let created = 0;
    let skipped = 0;
    const slotType = isCourse ? "course" : "normal";

    for (const slot of slotsToInsert) {
      try {
        await sql`
          INSERT INTO slots (date, time, max_bookings, type)
          VALUES (${slot.date}, ${slot.time}, 4, ${slotType})
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
