import { useState, useEffect, useRef } from "react";
import DatePickerField from "./DatePickerField";

// ---------- helper date (tutto in ora locale, senza toISOString) ----------
const pad = (n) => String(n).padStart(2, "0");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => new Date(`${s}T00:00:00`);
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
// settimana da lunedì a domenica
const startOfWeek = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return addDays(x, -((x.getDay() + 6) % 7));
};

function getRange(mode, anchor, custom) {
  if (mode === "week") {
    const s = startOfWeek(anchor);
    return { from: toISO(s), to: toISO(addDays(s, 6)) };
  }
  if (mode === "month") {
    const s = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const e = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { from: toISO(s), to: toISO(e) };
  }
  return custom;
}

function periodLabel(mode, anchor) {
  if (mode === "month") {
    return cap(
      anchor.toLocaleDateString("it-IT", { month: "long", year: "numeric" }),
    );
  }
  const s = startOfWeek(anchor);
  const e = addDays(s, 6);
  const a = s.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const b = e.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${a} – ${b}`;
}

function formatDay(iso) {
  const d = fromISO(iso);
  const w = d.toLocaleDateString("it-IT", { weekday: "short" }).replace(".", "");
  return `${cap(w)} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

// ---------- helper ore ----------
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function minutesBetween(start, end) {
  if (!TIME_RE.test(start || "") || !TIME_RE.test(end || "")) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? diff : null;
}

function formatMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function formatDecimal(min) {
  return `${(min / 60).toLocaleString("it-IT", { maximumFractionDigits: 2 })} h`;
}

// ---------- componente ----------
export default function TrainerHoursTab({ headers }) {
  const headersRef = useRef(headers);
  headersRef.current = headers;

  const todayISO = toISO(new Date());
  const emptyForm = {
    trainer_id: "",
    work_date: todayISO,
    start_time: "",
    end_time: "",
    notes: "",
  };

  const [trainers, setTrainers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState("month"); // week | month | range
  const [anchor, setAnchor] = useState(new Date());
  const [custom, setCustom] = useState({ from: todayISO, to: todayISO });
  const [filterTrainer, setFilterTrainer] = useState("all");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");

  const [showTrainers, setShowTrainers] = useState(false);
  const [newTrainer, setNewTrainer] = useState("");

  const formRef = useRef(null);

  const range = getRange(mode, anchor, custom);
  const rangeValid =
    /^\d{4}-\d{2}-\d{2}$/.test(range.from || "") &&
    /^\d{4}-\d{2}-\d{2}$/.test(range.to || "") &&
    range.from <= range.to;

  const api = async (qs, opts = {}) => {
    const res = await fetch(`/api/admin/users?${qs}`, {
      headers: headersRef.current,
      ...opts,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Errore (${res.status})`);
    return data;
  };

  const loadTrainers = async () => {
    try {
      const data = await api("resource=trainers");
      setTrainers(data);
      if (data.length === 0) setShowTrainers(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const loadEntries = async () => {
    if (!rangeValid) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        resource: "work-hours",
        from: range.from,
        to: range.to,
      });
      if (filterTrainer !== "all") qs.set("trainerId", filterTrainer);
      setEntries(await api(qs.toString()));
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [range.from, range.to, filterTrainer]);

  const showFlash = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(""), 3500);
  };

  // ----- registrazione ore -----
  const previewMinutes = minutesBetween(form.start_time, form.end_time);

  const saveEntry = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.trainer_id) {
      alert("Seleziona un PT");
      return;
    }
    if (!form.work_date) {
      alert("Seleziona la data");
      return;
    }
    if (!previewMinutes) {
      alert("Controlla gli orari: la fine deve essere dopo l'inizio");
      return;
    }
    setSaving(true);
    try {
      const body = JSON.stringify({
        ...form,
        trainer_id: Number(form.trainer_id),
      });
      const wasEditing = editingId !== null;
      if (wasEditing) {
        await api(`resource=work-hours&id=${editingId}`, {
          method: "PATCH",
          body,
        });
      } else {
        await api("resource=work-hours", { method: "POST", body });
      }
      const outside =
        form.work_date < range.from ||
        form.work_date > range.to ||
        (filterTrainer !== "all" && filterTrainer !== form.trainer_id);
      showFlash(
        (wasEditing ? "Registrazione aggiornata" : "Registrazione salvata") +
          (outside ? " (fuori dal periodo o dal filtro mostrato)" : ""),
      );
      setEditingId(null);
      setForm((f) => ({
        ...emptyForm,
        trainer_id: f.trainer_id,
        work_date: f.work_date,
      }));
      await loadEntries();
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const startEdit = (en) => {
    setEditingId(en.id);
    setForm({
      trainer_id: String(en.trainer_id),
      work_date: en.work_date,
      start_time: en.start_time,
      end_time: en.end_time,
      notes: en.notes || "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm((f) => ({
      ...emptyForm,
      trainer_id: f.trainer_id,
      work_date: f.work_date,
    }));
  };

  const deleteEntry = async (en) => {
    if (
      !confirm(
        `Eliminare la registrazione di ${en.trainer_name} del ${formatDay(en.work_date)} (${en.start_time}–${en.end_time})?`,
      )
    )
      return;
    try {
      await api(`resource=work-hours&id=${en.id}`, { method: "DELETE" });
      if (editingId === en.id) cancelEdit();
      await loadEntries();
    } catch (err) {
      alert(err.message);
    }
  };

  // ----- gestione PT -----
  const addTrainer = async (e) => {
    e.preventDefault();
    const name = newTrainer.trim();
    if (!name) return;
    try {
      await api("resource=trainers", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setNewTrainer("");
      await loadTrainers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleTrainer = async (t) => {
    if (
      t.is_active &&
      !confirm(
        `Disattivare ${t.name}? Non comparirà più nella registrazione ore, ma lo storico resta consultabile.`,
      )
    )
      return;
    try {
      await api(`resource=trainers&id=${t.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !t.is_active }),
      });
      await loadTrainers();
    } catch (err) {
      alert(err.message);
    }
  };

  // ----- navigazione periodo -----
  const shiftPeriod = (dir) => {
    setAnchor((a) =>
      mode === "week"
        ? addDays(a, 7 * dir)
        : new Date(a.getFullYear(), a.getMonth() + dir, 1),
    );
  };

  // ----- riepilogo -----
  const groups = [];
  const byTrainer = {};
  entries.forEach((en) => {
    if (!byTrainer[en.trainer_id]) {
      byTrainer[en.trainer_id] = {
        id: en.trainer_id,
        name: en.trainer_name,
        minutes: 0,
        items: [],
      };
      groups.push(byTrainer[en.trainer_id]);
    }
    byTrainer[en.trainer_id].items.push(en);
    byTrainer[en.trainer_id].minutes += Number(en.minutes);
  });
  const totalMinutes = groups.reduce((sum, g) => sum + g.minutes, 0);

  const formTrainers = trainers.filter(
    (t) => t.is_active || String(t.id) === form.trainer_id,
  );
  const activeCount = trainers.filter((t) => t.is_active).length;

  return (
    <div className="pt-wrap">
      {flash && <div className="pt-flash">{flash}</div>}

      {/* REGISTRA ORE */}
      <form className="pt-card" onSubmit={saveEntry} ref={formRef}>
        <h3 className="pt-card-title">
          {editingId ? "Modifica registrazione" : "Registra ore"}
        </h3>

        <div className="pt-form-grid">
          <label className="pt-field pt-field-full">
            <span>Personal trainer</span>
            <select
              className="pt-input"
              value={form.trainer_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, trainer_id: e.target.value }))
              }
              required
            >
              <option value="">Seleziona un PT…</option>
              {formTrainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {!t.is_active ? " (non attivo)" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="pt-field pt-field-full">
            <span>Data</span>
            <DatePickerField
              value={form.work_date}
              onChange={(val) => setForm((f) => ({ ...f, work_date: val }))}
            />
          </div>

          <label className="pt-field">
            <span>Inizio</span>
            <input
              type="time"
              className="pt-input"
              value={form.start_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_time: e.target.value }))
              }
              required
            />
          </label>

          <label className="pt-field">
            <span>Fine</span>
            <input
              type="time"
              className="pt-input"
              value={form.end_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_time: e.target.value }))
              }
              required
            />
          </label>

          <label className="pt-field pt-field-full">
            <span>Note (opzionale)</span>
            <input
              type="text"
              className="pt-input"
              placeholder="Es. sostituzione, corso, straordinario…"
              value={form.notes}
              maxLength={300}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </label>
        </div>

        <div
          className={`pt-preview ${previewMinutes ? "ok" : ""} ${
            form.start_time && form.end_time && !previewMinutes ? "bad" : ""
          }`}
        >
          {previewMinutes
            ? `Ore effettive: ${formatMinutes(previewMinutes)} (${formatDecimal(previewMinutes)})`
            : form.start_time && form.end_time
              ? "La fine deve essere dopo l'inizio"
              : "Inserisci inizio e fine per calcolare le ore"}
        </div>

        <div className="modal-actions">
          <button
            type="submit"
            className="btn"
            disabled={saving || trainers.length === 0}
          >
            {saving
              ? "Salvataggio…"
              : editingId
                ? "Salva modifiche"
                : "Salva registrazione"}
          </button>
          {editingId && (
            <button type="button" className="btn-danger" onClick={cancelEdit}>
              Annulla
            </button>
          )}
        </div>
      </form>

      {/* RIEPILOGO */}
      <div className="pt-card">
        <h3 className="pt-card-title">Riepilogo ore</h3>

        <div className="pt-modes">
          {[
            ["week", "Settimana"],
            ["month", "Mese"],
            ["range", "Intervallo"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`tab-btn ${mode === key ? "active" : ""}`}
              onClick={() => setMode(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "range" ? (
          <div className="pt-range">
            <div className="pt-field">
              <span>Dal</span>
              <DatePickerField
                value={custom.from}
                onChange={(val) => setCustom((c) => ({ ...c, from: val }))}
              />
            </div>
            <div className="pt-field">
              <span>Al</span>
              <DatePickerField
                value={custom.to}
                onChange={(val) => setCustom((c) => ({ ...c, to: val }))}
              />
            </div>
          </div>
        ) : (
          <div className="pt-period">
            <button
              type="button"
              className="body-nav-btn"
              aria-label="Periodo precedente"
              onClick={() => shiftPeriod(-1)}
            >
              ‹
            </button>
            <span className="pt-period-label">{periodLabel(mode, anchor)}</span>
            <button
              type="button"
              className="body-nav-btn"
              aria-label="Periodo successivo"
              onClick={() => shiftPeriod(1)}
            >
              ›
            </button>
          </div>
        )}

        <label className="pt-field pt-field-full">
          <span>Personal trainer</span>
          <select
            className="pt-input"
            value={filterTrainer}
            onChange={(e) => setFilterTrainer(e.target.value)}
          >
            <option value="all">Tutti i PT</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {!t.is_active ? " (non attivo)" : ""}
              </option>
            ))}
          </select>
        </label>

        {!rangeValid ? (
          <p className="pt-empty">
            Intervallo non valido: la data iniziale deve precedere quella
            finale.
          </p>
        ) : loading ? (
          <p className="pt-empty">Caricamento…</p>
        ) : groups.length === 0 ? (
          <p className="pt-empty">Nessuna registrazione nel periodo scelto.</p>
        ) : (
          <>
            <div className="pt-total">
              <span className="pt-total-label">
                Totale {groups.length > 1 ? "di tutti i PT" : "periodo"}
              </span>
              <span className="pt-total-value">
                {formatMinutes(totalMinutes)}
                <small> · {formatDecimal(totalMinutes)}</small>
              </span>
            </div>

            {groups.map((g) => (
              <div key={g.id} className="pt-group">
                <div className="pt-group-head">
                  <span className="pt-group-name">{g.name}</span>
                  <span className="user-card-badge badge-teal">
                    {formatMinutes(g.minutes)} · {formatDecimal(g.minutes)}
                  </span>
                </div>

                {g.items.map((en) => (
                  <div
                    key={en.id}
                    className={`pt-entry ${editingId === en.id ? "editing" : ""}`}
                  >
                    <div className="pt-entry-top">
                      <span className="pt-entry-date">
                        {formatDay(en.work_date)}
                      </span>
                      <span className="pt-entry-time">
                        {en.start_time} – {en.end_time}
                      </span>
                      <span className="pt-entry-hours">
                        {formatMinutes(Number(en.minutes))}
                      </span>
                    </div>
                    {en.notes && <div className="pt-entry-notes">{en.notes}</div>}
                    <div className="pt-entry-actions">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => startEdit(en)}
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => deleteEntry(en)}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* COLLABORATORI */}
      <div className="pt-card">
        <button
          type="button"
          className="pt-toggle"
          onClick={() => setShowTrainers((s) => !s)}
        >
          <span>
            Collaboratori <small>({activeCount} attivi)</small>
          </span>
          <span>{showTrainers ? "−" : "+"}</span>
        </button>

        {showTrainers && (
          <div className="pt-trainers">
            <form className="pt-add-trainer" onSubmit={addTrainer}>
              <input
                type="text"
                className="pt-input"
                placeholder="Nome e cognome del nuovo PT"
                value={newTrainer}
                maxLength={100}
                onChange={(e) => setNewTrainer(e.target.value)}
              />
              <button type="submit" className="btn">
                Aggiungi
              </button>
            </form>

            {trainers.length === 0 && (
              <p className="pt-empty">
                Nessun PT inserito. Aggiungi il primo per iniziare a registrare
                le ore.
              </p>
            )}

            {trainers.map((t) => (
              <div
                key={t.id}
                className={`pt-trainer-row ${t.is_active ? "" : "inactive"}`}
              >
                <span className="pt-trainer-name">{t.name}</span>
                <span
                  className={`user-card-badge ${t.is_active ? "badge-teal" : "badge-grey"}`}
                >
                  {t.is_active ? "Attivo" : "Non attivo"}
                </span>
                <button
                  type="button"
                  className={t.is_active ? "btn-danger" : "btn"}
                  onClick={() => toggleTrainer(t)}
                >
                  {t.is_active ? "Disattiva" : "Riattiva"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
