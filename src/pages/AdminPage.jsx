import { useState, useEffect, useRef } from "react";
import DatePickerField from "../components/DatePickerField";
import TimePickerField from "../components/TimePickerField";

const statusLabels = {
  confirmed: "Confermata",
  attended: "Presente",
  absent: "Assente",
  cancelled: "Cancellata",
};

function SlotsGrouped({ slots, onDelete }) {
  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const getDefaultDate = () => {
    const todayStr = new Date().toLocaleDateString("sv-SE");
    if (sortedDates.includes(todayStr)) return todayStr;
    const nextDate = sortedDates.find((d) => d >= todayStr);
    return nextDate || sortedDates[0] || null;
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());

  useEffect(() => {
    if (sortedDates.length > 0 && !sortedDates.includes(selectedDate)) {
      setSelectedDate(getDefaultDate());
    }
  }, [slots]);

  const dayLabel = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      weekday: d
        .toLocaleDateString("it-IT", { weekday: "short" })
        .toUpperCase(),
      day: d.getDate(),
    };
  };

  const tabRefs = {};
  const tabsContainerRef = useRef(null);

  useEffect(() => {
    if (selectedDate && tabRefs[selectedDate]) {
      tabRefs[selectedDate].scrollIntoView({
        inline: "start",
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [selectedDate]);

  const currentSlots = selectedDate
    ? [...(grouped[selectedDate] || [])].sort((a, b) =>
        a.time.localeCompare(b.time),
      )
    : [];

  return (
    <div className="admin-agenda">
      <div className="sm-day-tabs">
        {sortedDates.map((date) => {
          const { weekday, day } = dayLabel(date);
          const activeCount = grouped[date].filter((s) => s.is_active).length;
          const isActive = date === selectedDate;
          const isPastDay = new Date(date + "T23:59:59") < new Date();
          return (
            <button
              key={date}
              ref={(el) => (tabRefs[date] = el)}
              className={`sm-day-tab ${isActive ? "active" : ""} ${isPastDay ? "sm-day-past" : ""}`}
              onClick={() => setSelectedDate(date)}
              type="button"
            >
              <span className="sm-day-weekday">{weekday}</span>
              <span className="sm-day-number">{day}</span>
              <span className="sm-day-badge">
                {activeCount}/{grouped[date].length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="slot-day-content agenda-content">
        {currentSlots.map((s) => {
          const slotDateTime = new Date(`${s.date}T${s.time}`);
          const isPast = slotDateTime < new Date();

          return (
            <div
              key={s.id}
              className={`booking-agenda-item ${!s.is_active || isPast ? "inactive" : ""}`}
            >
              <span className="booking-agenda-time">{s.time.slice(0, 5)}</span>
              <div className="booking-agenda-info">
                <span className="booking-agenda-name">
                  {s.booked_count}/{s.max_bookings} prenotati
                </span>
              </div>
              {s.is_active && !isPast && (
                <button className="btn-danger" onClick={() => onDelete(s.id)}>
                  Disattiva
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingsGrouped({ bookings, onMark }) {
  const grouped = bookings.reduce((acc, b) => {
    if (!acc[b.date]) acc[b.date] = [];
    acc[b.date].push(b);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  const getDefaultDate = () => {
    const todayStr = new Date().toLocaleDateString("sv-SE"); // formato YYYY-MM-DD
    if (sortedDates.includes(todayStr)) return todayStr;
    const nextDate = sortedDates.find((d) => d >= todayStr);
    return nextDate || sortedDates[0] || null;
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());

  useEffect(() => {
    if (sortedDates.length > 0 && !sortedDates.includes(selectedDate)) {
      setSelectedDate(getDefaultDate());
    }
  }, [bookings]);

  const dayLabel = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      weekday: d
        .toLocaleDateString("it-IT", { weekday: "short" })
        .toUpperCase(),
      day: d.getDate(),
    };
  };

  const tabRefs = {};

  useEffect(() => {
    if (selectedDate && tabRefs[selectedDate]) {
      tabRefs[selectedDate].scrollIntoView({
        inline: "start",
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [selectedDate]);

  const currentBookings = selectedDate
    ? [...(grouped[selectedDate] || [])].sort((a, b) =>
        a.time.localeCompare(b.time),
      )
    : [];

  return (
    <div className="admin-agenda">
      <div className="sm-day-tabs">
        {sortedDates.map((date) => {
          const { weekday, day } = dayLabel(date);
          const count = grouped[date].length;
          const isActive = date === selectedDate;
          return (
            <button
              key={date}
              ref={(el) => (tabRefs[date] = el)}
              className={`sm-day-tab ${isActive ? "active" : ""}`}
              onClick={() => setSelectedDate(date)}
              type="button"
            >
              <span className="sm-day-weekday">{weekday}</span>
              <span className="sm-day-number">{day}</span>
              <span className="sm-day-badge">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="slot-day-content agenda-content">
        {currentBookings.map((b) => (
          <div
            key={b.id}
            className={`booking-agenda-item ${b.status === "cancelled" ? "inactive" : ""}`}
          >
            <span className="booking-agenda-time">{b.time.slice(0, 5)}</span>
            <div className="booking-agenda-info">
              <span className="booking-agenda-name">{b.name}</span>
              <span className="booking-agenda-email">{b.email}</span>
            </div>
            <span className={`booking-agenda-status status-${b.status}`}>
              {statusLabels[b.status] || b.status}
            </span>
            {b.status === "confirmed" && (
              <div className="booking-agenda-actions">
                <button
                  className="btn"
                  onClick={() => onMark(b.id, "attended")}
                >
                  Presente
                </button>
                <button
                  className="btn-danger"
                  onClick={() => onMark(b.id, "absent")}
                >
                  Assente
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("bookings"); // "prenotazioni" | "slots" | "users" | "reels"

  const [closeDate, setCloseDate] = useState("");

  const [reels, setReels] = useState([]);
  const [newReel, setNewReel] = useState({ url: "", caption: "" });

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    total_entries: 10,
    starts_at: "",
  });
  const [userMsg, setUserMsg] = useState("");

  const [userSort, setUserSort] = useState("name-asc");

  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });

  const [bookings, setBookings] = useState([]);

  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    const res = await fetch("/api/admin/bookings?stats=1", { headers });
    setStats(await res.json());
  };

  const headers = {
    "x-admin-password": password,
    "Content-Type": "application/json",
  };

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/reels", { headers });
    if (res.ok) {
      setAuthed(true);
      setReels(await res.json());
    } else {
      alert("Password errata");
    }
  };

  // REELS
  const loadReels = async () => {
    const res = await fetch("/api/admin/reels", { headers });
    setReels(await res.json());
  };
  const addReel = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/reels", {
      method: "POST",
      headers,
      body: JSON.stringify(newReel),
    });
    setNewReel({ url: "", caption: "" });
    loadReels();
  };
  const deleteReel = async (id) => {
    if (!confirm("Rimuovere questo reel?")) return;
    await fetch(`/api/admin/reels?id=${id}`, { method: "DELETE", headers });
    loadReels();
  };

  // USERS
  const loadUsers = async () => {
    const res = await fetch("/api/admin/users", { headers });
    setUsers(await res.json());
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (userSort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "sessions-desc":
        return b.total_sessions - a.total_sessions;
      case "expiry-asc":
        if (!a.expires_at) return 1;
        if (!b.expires_at) return -1;
        return new Date(a.expires_at) - new Date(b.expires_at);
      default:
        return 0;
    }
  });

  const addUser = async (e) => {
    e.preventDefault();
    setUserMsg("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers,
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (!res.ok) {
      setUserMsg(data.error || "Errore");
      return;
    }
    setUserMsg(
      `✅ Utente creato: ${newUser.email} / password: ${newUser.password}`,
    );
    setNewUser({
      name: "",
      email: "",
      password: "",
      total_entries: 10,
      starts_at: "",
    });
    loadUsers();
  };

  // SLOTS
  const loadSlots = async () => {
    const res = await fetch("/api/admin/slots", { headers });
    setSlots(await res.json());
  };
  const addSlot = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers,
      body: JSON.stringify(newSlot),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setNewSlot({ date: "", time: "" });
    loadSlots();
  };
  const deleteSlot = async (id) => {
    if (!confirm("Disattivare questo slot?")) return;
    await fetch(`/api/admin/slots?id=${id}`, { method: "DELETE", headers });
    loadSlots();
  };

  const closeDay = async () => {
    if (!closeDate) return;
    if (
      !confirm(
        `Chiudere tutti gli slot del ${closeDate}? Le prenotazioni confermate verranno cancellate e gli ingressi ripristinati.`,
      )
    )
      return;

    const res = await fetch("/api/admin/close-day", {
      method: "POST",
      headers,
      body: JSON.stringify({ date: closeDate }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert(`Giorno chiuso. ${data.cancelledBookings} prenotazioni cancellate.`);
    setCloseDate("");
    loadSlots();
  };

  const generateSlots = async () => {
    if (
      !confirm(
        "Generare gli slot standard per le prossime 4 settimane? (Lun-Ven 9-19, Sab 9-13, ogni 45 min)",
      )
    )
      return;

    const res = await fetch("/api/admin/generate-slots", {
      method: "POST",
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert(
      `Generati ${data.created} nuovi slot (${data.skipped} già esistenti, saltati).`,
    );
    loadSlots();
  };

  // BOOKINGS
  const loadBookings = async () => {
    const res = await fetch("/api/admin/bookings", { headers });
    setBookings(await res.json());
  };
  const markBooking = async (id, status) => {
    await fetch(`/api/admin/bookings?id=${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    loadBookings();
  };

  useEffect(() => {
    if (!authed) return;
    if (tab === "reels") loadReels();
    if (tab === "users") loadUsers();
    if (tab === "slots") loadSlots();
    if (tab === "bookings") {
      loadBookings();
      loadStats();
    }
  }, [authed, tab]);

  if (!authed) {
    return (
      <div className="admin-login">
        <form onSubmit={login}>
          <h2>Admin FisioFitness</h2>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn">
            Accedi
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Pannello Admin</h1>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${tab === "bookings" ? "active" : ""}`}
          onClick={() => setTab("bookings")}
        >
          Prenotazioni
        </button>
        <button
          className={`tab-btn ${tab === "slots" ? "active" : ""}`}
          onClick={() => setTab("slots")}
        >
          Slot
        </button>
        <button
          className={`tab-btn ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          Utenti
        </button>

        <button
          className={`tab-btn ${tab === "reels" ? "active" : ""}`}
          onClick={() => setTab("reels")}
        >
          Reel
        </button>
      </div>

      {/* TAB REELS */}
      {tab === "reels" && (
        <div className="admin-reels">
          <form className="add-slot-form" onSubmit={addReel}>
            <h3>Aggiungi Reel</h3>
            <input
              type="url"
              required
              placeholder="https://www.instagram.com/reel/ABC123/"
              value={newReel.url}
              onChange={(e) =>
                setNewReel((r) => ({ ...r, url: e.target.value }))
              }
              style={{ minWidth: 320 }}
            />
            <input
              type="text"
              placeholder="Didascalia (opzionale)"
              value={newReel.caption}
              onChange={(e) =>
                setNewReel((r) => ({ ...r, caption: e.target.value }))
              }
            />
            <button type="submit" className="btn">
              Aggiungi
            </button>
          </form>
          <div className="reel-cards">
            {reels.map((r) => (
              <div
                key={r.id}
                className={`reel-admin-card ${!r.is_active ? "inactive" : ""}`}
              >
                <div className="reel-admin-info">
                  <span className="reel-admin-url">{r.url}</span>
                  {r.caption && (
                    <span className="reel-admin-caption">{r.caption}</span>
                  )}
                </div>
                {r.is_active && (
                  <button
                    className="btn-danger"
                    onClick={() => deleteReel(r.id)}
                  >
                    Rimuovi
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB UTENTI */}
      {tab === "users" && (
        <div className="admin-users">
          <form className="add-slot-form" onSubmit={addUser}>
            <h3>Nuovo utente + abbonamento</h3>
            <input
              type="text"
              required
              placeholder="Nome e cognome"
              value={newUser.name}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, name: e.target.value }))
              }
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, email: e.target.value }))
              }
            />
            <input
              type="text"
              required
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, password: e.target.value }))
              }
            />
            <input
              type="number"
              required
              min="1"
              placeholder="Ingressi"
              value={newUser.total_entries}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, total_entries: e.target.value }))
              }
              style={{ width: 100 }}
            />
            <DatePickerField
              value={newUser.starts_at}
              onChange={(val) => setNewUser((u) => ({ ...u, starts_at: val }))}
            />
            <button type="submit" className="btn">
              Crea utente
            </button>
          </form>
          {userMsg && (
            <p
              style={{
                marginBottom: 20,
                color: "#146272",
                fontWeight: "bold",
              }}
            >
              {userMsg}
            </p>
          )}

          <div className="user-list-toolbar">
            <span className="user-list-count">{users.length} utenti</span>
            <select
              className="user-sort-select"
              value={userSort}
              onChange={(e) => setUserSort(e.target.value)}
            >
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
              <option value="sessions-desc">Più sedute totali</option>
              <option value="expiry-asc">Scadenza più vicina</option>
            </select>
          </div>

          <div className="user-cards">
            {sortedUsers.map((u) => (
              <div key={u.id} className="user-card">
                <div className="user-card-header">
                  <span className="user-card-name">{u.name}</span>
                  <span className="user-card-email">{u.email}</span>
                </div>
                <div className="user-card-body">
                  {u.subscription_id ? (
                    <span className="user-card-badge badge-teal">
                      {u.used_entries}/{u.total_entries} ingressi · scade{" "}
                      {new Date(u.expires_at).toLocaleDateString("it-IT")}
                    </span>
                  ) : (
                    <span className="user-card-badge badge-red">
                      Nessun abbonamento
                    </span>
                  )}
                  <span className="user-card-badge badge-grey">
                    📊 {u.sessions_this_year} quest'anno · {u.total_sessions}{" "}
                    totali
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB SLOT */}
      {tab === "slots" && (
        <div className="admin-slots">
          <div style={{ marginBottom: 20 }}>
            <button type="button" className="btn" onClick={generateSlots}>
              📅 Genera slot standard (prossime 4 settimane)
            </button>
          </div>

          <div
            className="add-slot-form"
            style={{
              background: "#fdecea",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <h3 style={{ color: "#c00" }}>
              Chiudi giornata (es. ferie, imprevisto)
            </h3>
            <DatePickerField value={closeDate} onChange={setCloseDate} />

            <button type="button" className="btn-danger" onClick={closeDay}>
              Chiudi giorno
            </button>
          </div>

          <form className="add-slot-form" onSubmit={addSlot}>
            <h3>Aggiungi slot</h3>
            <DatePickerField
              value={newSlot.date}
              onChange={(val) => setNewSlot((s) => ({ ...s, date: val }))}
            />
            <TimePickerField
              value={newSlot.time}
              onChange={(val) => setNewSlot((s) => ({ ...s, time: val }))}
            />
            <button type="submit" className="btn">
              Aggiungi
            </button>
          </form>

          <SlotsGrouped slots={slots} onDelete={deleteSlot} />
        </div>
      )}

      {/* TAB PRENOTAZIONI */}
      {tab === "bookings" && (
        <div className="admin-bookings">
          {stats && (
            <div className="stats-panel">
              <div className="stats-total">
                <span className="stats-total-number">{stats.total}</span>
                <span className="stats-total-label">Prenotazioni totali</span>
              </div>
              <div className="stats-monthly">
                {stats.monthly.map((m) => {
                  const [year, month] = m.month.split("-");
                  const monthName = new Date(
                    `${year}-${month}-01`,
                  ).toLocaleDateString("it-IT", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <div key={m.month} className="stats-month-item">
                      <span className="stats-month-name">
                        {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                      </span>
                      <span className="stats-month-count">{m.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {bookings.length === 0 ? (
            <p>Nessuna prenotazione ancora.</p>
          ) : (
            <BookingsGrouped bookings={bookings} onMark={markBooking} />
          )}
        </div>
      )}
    </div>
  );
}
