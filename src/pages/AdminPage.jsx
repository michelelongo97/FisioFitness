import { useState, useEffect } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("reels"); // "reels" | "users"

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

  useEffect(() => {
    if (!authed) return;
    if (tab === "reels") loadReels();
    if (tab === "users") loadUsers();
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
              style={{ marginBottom: 20, color: "#146272", fontWeight: "bold" }}
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
    </div>
  );
}
