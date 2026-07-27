import { sql } from "@vercel/postgres";

function checkAuth(req, res) {
  if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Non autorizzato" });
    return false;
  }
  return true;
}

// Genera gli orari di un giorno, ogni 45 minuti, tra start e end
function generateTimesForDay(startHour, startMin, endHour, endMin) {
  const times = [];
  let h = startHour,
    m = startMin;
  while (h < endHour || (h === endHour && m < endMin)) {
    times.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`,
    );
    m += 45;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
  }
  return times;
}

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
      const times =
        dayOfWeek === 6
          ? generateTimesForDay(9, 0, 13, 0) // sabato: 9-13
          : generateTimesForDay(9, 0, 19, 0); // lun-ven: 9-19

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
          skipped++; // già esisteva, salta
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
