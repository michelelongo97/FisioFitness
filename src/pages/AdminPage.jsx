import { useState, useEffect } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [reels, setReels] = useState([]);
  const [newReel, setNewReel] = useState({ url: "", caption: "" });

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

      <div className="admin-reels">
        <form className="add-slot-form" onSubmit={addReel}>
          <h3>Aggiungi Reel</h3>
          <input
            type="url"
            required
            placeholder="https://www.instagram.com/reel/ABC123/"
            value={newReel.url}
            onChange={(e) => setNewReel((r) => ({ ...r, url: e.target.value }))}
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
                style={{ fontSize: 13, color: "#555", wordBreak: "break-all" }}
              >
                {r.url}
              </span>
              {r.caption && (
                <span style={{ color: "#888", fontSize: 13 }}>{r.caption}</span>
              )}
              {r.is_active && (
                <button className="btn-danger" onClick={() => deleteReel(r.id)}>
                  Rimuovi
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
