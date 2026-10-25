import { sql } from "@vercel/postgres";

// Gestione PT e ore lavorate.
// Viene chiamato da api/admin/users.js (resource=trainers | work-hours) dopo il
// controllo della password admin: qui NON si controlla l'autenticazione.
// Sta fuori da api/ per non occupare una funzione serverless in più (limite 12).

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRealDate(s) {
  if (typeof s !== "string" || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function handleTrainers(req, res) {
  try {
    if (req.query.resource === "trainers") return await trainers(req, res);
    return await workHours(req, res);
  } catch (err) {
    console.error("Errore ore PT:", err);
    return res.status(500).json({ error: "Errore del server, riprova" });
  }
}

// ---------------------------------------------------------------- COLLABORATORI
async function trainers(req, res) {
  if (req.method === "GET") {
    const { rows } = await sql`
      SELECT id, name, is_active
      FROM trainers
      ORDER BY is_active DESC, lower(name)
    `;
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const name = String(req.body?.name || "")
      .trim()
      .replace(/\s+/g, " ");
    if (!name || name.length > 100) {
      return res
        .status(400)
        .json({ error: "Inserisci un nome (massimo 100 caratteri)" });
    }
    const { rows: dup } = await sql`
      SELECT 1 FROM trainers WHERE lower(name) = lower(${name}) LIMIT 1
    `;
    if (dup.length > 0) {
      return res
        .status(409)
        .json({ error: "Esiste già un PT con questo nome" });
    }
    const { rows } = await sql`
      INSERT INTO trainers (name) VALUES (${name})
      RETURNING id, name, is_active
    `;
    return res.status(201).json(rows[0]);
  }

  if (req.method === "PATCH") {
    const id = toId(req.query.id);
    if (!id || typeof req.body?.is_active !== "boolean") {
      return res.status(400).json({ error: "Dati non validi" });
    }
    const { rows } = await sql`
      UPDATE trainers SET is_active = ${req.body.is_active}
      WHERE id = ${id}
      RETURNING id, name, is_active
    `;
    if (rows.length === 0) {
      return res.status(404).json({ error: "PT non trovato" });
    }
    return res.status(200).json(rows[0]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// ---------------------------------------------------------------- ORE LAVORATE
function parseEntry(body) {
  const trainer_id = toId(body?.trainer_id);
  const work_date = body?.work_date;
  const start_time = body?.start_time;
  const end_time = body?.end_time;
  const notes = String(body?.notes || "").trim();

  if (!trainer_id) return { error: "Seleziona un PT" };
  if (!isRealDate(work_date)) return { error: "Data non valida" };
  if (!TIME_RE.test(start_time || "") || !TIME_RE.test(end_time || "")) {
    return { error: "Orario non valido" };
  }
  if (toMinutes(end_time) <= toMinutes(start_time)) {
    return { error: "La fine deve essere dopo l'inizio" };
  }
  if (notes.length > 300) {
    return { error: "Le note sono troppo lunghe (massimo 300 caratteri)" };
  }
  return {
    value: {
      trainer_id,
      work_date,
      start_time,
      end_time,
      notes: notes || null,
    },
  };
}

async function workHours(req, res) {
  // ----- elenco per periodo
  if (req.method === "GET") {
    const { from, to } = req.query;
    if (!isRealDate(from) || !isRealDate(to) || from > to) {
      return res.status(400).json({ error: "Intervallo di date non valido" });
    }
    const trainerId = req.query.trainerId ? toId(req.query.trainerId) : null;
    if (req.query.trainerId && !trainerId) {
      return res.status(400).json({ error: "PT non valido" });
    }
    const { rows } = await sql`
      SELECT h.id, h.trainer_id, t.name AS trainer_name,
        to_char(h.work_date, 'YYYY-MM-DD') AS work_date,
        to_char(h.start_time, 'HH24:MI') AS start_time,
        to_char(h.end_time, 'HH24:MI') AS end_time,
        (EXTRACT(EPOCH FROM (h.end_time - h.start_time)) / 60)::int AS minutes,
        h.notes
      FROM trainer_hours h
      JOIN trainers t ON t.id = h.trainer_id
      WHERE h.work_date >= ${from}::date
        AND h.work_date <= ${to}::date
        AND (${trainerId}::int IS NULL OR h.trainer_id = ${trainerId}::int)
      ORDER BY lower(t.name), t.id, h.work_date, h.start_time
    `;
    return res.status(200).json(rows);
  }

  // ----- inserimento e modifica
  if (req.method === "POST" || req.method === "PATCH") {
    const editId = req.method === "PATCH" ? toId(req.query.id) : null;
    if (req.method === "PATCH" && !editId) {
      return res.status(400).json({ error: "Registrazione non valida" });
    }

    const parsed = parseEntry(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const e = parsed.value;

    let existing = null;
    if (editId) {
      const { rows } = await sql`
        SELECT trainer_id FROM trainer_hours WHERE id = ${editId}
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Registrazione non trovata" });
      }
      existing = rows[0];
    }

    const { rows: tr } = await sql`
      SELECT is_active FROM trainers WHERE id = ${e.trainer_id}
    `;
    if (tr.length === 0) {
      return res.status(400).json({ error: "PT non trovato" });
    }
    // un PT disattivato non riceve nuove ore, ma le sue vecchie voci restano modificabili
    const sameTrainer = existing && existing.trainer_id === e.trainer_id;
    if (!tr[0].is_active && !sameTrainer) {
      return res.status(400).json({ error: "Questo PT non è più attivo" });
    }

    // stesso PT, stesso giorno: niente fasce sovrapposte (evita ore contate due volte)
    const { rows: overlap } = await sql`
      SELECT 1 FROM trainer_hours
      WHERE trainer_id = ${e.trainer_id}
        AND work_date = ${e.work_date}::date
        AND start_time < ${e.end_time}::time
        AND end_time > ${e.start_time}::time
        AND id <> ${editId || 0}
      LIMIT 1
    `;
    if (overlap.length > 0) {
      return res.status(409).json({
        error:
          "Questo PT ha già ore registrate che si sovrappongono in quella fascia",
      });
    }

    if (editId) {
      await sql`
        UPDATE trainer_hours
        SET trainer_id = ${e.trainer_id},
            work_date = ${e.work_date}::date,
            start_time = ${e.start_time}::time,
            end_time = ${e.end_time}::time,
            notes = ${e.notes}
        WHERE id = ${editId}
      `;
      return res.status(200).json({ success: true });
    }

    const { rows } = await sql`
      INSERT INTO trainer_hours (trainer_id, work_date, start_time, end_time, notes)
      VALUES (${e.trainer_id}, ${e.work_date}::date, ${e.start_time}::time, ${e.end_time}::time, ${e.notes})
      RETURNING id
    `;
    return res.status(201).json({ id: rows[0].id });
  }

  // ----- eliminazione
  if (req.method === "DELETE") {
    const id = toId(req.query.id);
    if (!id) return res.status(400).json({ error: "Registrazione non valida" });
    const { rows } = await sql`
      DELETE FROM trainer_hours WHERE id = ${id} RETURNING id
    `;
    if (rows.length === 0) {
      return res.status(404).json({ error: "Registrazione non trovata" });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
