import { useState, useEffect } from "react";

function SlotsGrouped({ slots, onDelete }) {
  const [openDates, setOpenDates] = useState({});

  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const toggleDate = (date) => {
    setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="slots-grouped">
      {sortedDates.map((date) => {
        const daySlots = grouped[date];
        const activeCount = daySlots.filter((s) => s.is_active).length;
        const isOpen = openDates[date];

        return (
          <div key={date} className="slot-day-group">
            <button
              className="slot-day-header"
              onClick={() => toggleDate(date)}
              type="button"
            >
              <span>
                {new Date(date + "T00:00:00").toLocaleDateString("it-IT", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="slot-day-meta">
                {activeCount}/{daySlots.length} attivi {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {isOpen && (
              <div className="slot-day-content">
                {daySlots.map((s) => (
                  <div
                    key={s.id}
                    className={`slot-item ${!s.is_active ? "inactive" : ""}`}
                  >
                    <span>{s.time.slice(0, 5)}</span>
                    <span className="slot-count">
                      {s.booked_count}/{s.max_bookings} prenotati
                    </span>
                    {s.is_active && (
                      <button
                        className="btn-danger"
                        onClick={() => onDelete(s.id)}
                      >
                        Disattiva
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("reels"); // "reels" | "users" | "slots" | "bookings"

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

  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });

  const [bookings, setBookings] = useState([]);

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
    if (tab === "bookings") loadBookings();
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
          className={`tab-btn ${tab === "reels" ? "active" : ""}`}
          onClick={() => setTab("reels")}
        >
          Reel
        </button>
        <button
          className={`tab-btn ${tab === "users" ? "active" : ""}`}
          onClick={() => setTab("users")}
        >
          Utenti
        </button>
        <button
          className={`tab-btn ${tab === "slots" ? "active" : ""}`}
          onClick={() => setTab("slots")}
        >
          Slot
        </button>
        <button
          className={`tab-btn ${tab === "bookings" ? "active" : ""}`}
          onClick={() => setTab("bookings")}
        >
          Prenotazioni
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
          <div className="slots-list">
            {reels.map((r) => (
              <div
                key={r.id}
                className={`slot-item ${!r.is_active ? "inactive" : ""}`}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "#555",
                    wordBreak: "break-all",
                  }}
                >
                  {r.url}
                </span>
                {r.caption && (
                  <span style={{ color: "#888", fontSize: 13 }}>
                    {r.caption}
                  </span>
                )}
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
            <input
              type="date"
              required
              value={newUser.starts_at}
              onChange={(e) =>
                setNewUser((u) => ({ ...u, starts_at: e.target.value }))
              }
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
          <div className="slots-list">
            {users.map((u) => (
              <div key={u.id} className="slot-item">
                <span style={{ fontWeight: "bold" }}>{u.name}</span>
                <span style={{ color: "#666", fontSize: 13 }}>{u.email}</span>
                {u.subscription_id ? (
                  <span style={{ color: "#146272", fontSize: 13 }}>
                    {u.used_entries}/{u.total_entries} ingressi · scade{" "}
                    {new Date(u.expires_at).toLocaleDateString("it-IT")}
                  </span>
                ) : (
                  <span style={{ color: "#c00", fontSize: 13 }}>
                    Nessun abbonamento
                  </span>
                )}
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
            <input
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
            />

            <button type="button" className="btn-danger" onClick={closeDay}>
              Chiudi giorno
            </button>
          </div>

          <form className="add-slot-form" onSubmit={addSlot}>
            <h3>Aggiungi slot</h3>
            <input
              type="date"
              required
              value={newSlot.date}
              onChange={(e) =>
                setNewSlot((s) => ({ ...s, date: e.target.value }))
              }
            />
            <input
              type="time"
              required
              value={newSlot.time}
              onChange={(e) =>
                setNewSlot((s) => ({ ...s, time: e.target.value }))
              }
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
          {bookings.length === 0 ? (
            <p>Nessuna prenotazione ancora.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ora</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Stato</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className={b.status === "cancelled" ? "cancelled" : ""}
                  >
                    <td>
                      {new Date(b.date + "T00:00:00").toLocaleDateString(
                        "it-IT",
                      )}
                    </td>
                    <td>{b.time.slice(0, 5)}</td>
                    <td>{b.name}</td>
                    <td>{b.email}</td>
                    <td>{b.status}</td>
                    <td>
                      {b.status === "confirmed" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn"
                            onClick={() => markBooking(b.id, "attended")}
                          >
                            Presente
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => markBooking(b.id, "absent")}
                          >
                            Assente
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
