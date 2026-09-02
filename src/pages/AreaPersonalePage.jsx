import { useEffect, useState } from "react";
import { getUser, getToken, logout } from "../lib/auth";
import { EXERCISES, CATEGORIES } from "../lib/exercises";
import { useNavigate, Link } from "react-router-dom";

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatBookingDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const weekday = capitalize(
    date.toLocaleDateString("it-IT", { weekday: "long" }),
  );
  const day = date.getDate();
  const month = capitalize(date.toLocaleDateString("it-IT", { month: "long" }));
  return { weekday, day, month };
}

export default function AreaPersonalePage() {
  const statusLabels = {
    attended: "Presente",
    absent: "Assente",
    cancelled: "Cancellata",
  };
  const navigate = useNavigate();
  const user = getUser();
  const [subscription, setSubscription] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [maxLifts, setMaxLifts] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [liftForm, setLiftForm] = useState({ weight: "", reps: "" });
  const [selectedCategory, setSelectedCategory] = useState("gambe");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const loadData = async () => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    const [subResRaw, bookResRaw, liftsResRaw] = await Promise.all([
      fetch("/api/user/subscription", { headers }),
      fetch("/api/user/bookings", { headers }),
      fetch("/api/user/bookings?resource=lifts", { headers }),
    ]);

    // Se una qualsiasi richiesta torna 401, la sessione non è più valida
    if (
      subResRaw.status === 401 ||
      bookResRaw.status === 401 ||
      liftsResRaw.status === 401
    ) {
      logout();
      navigate("/login");
      return;
    }

    const subRes = await subResRaw.json();
    const bookRes = await bookResRaw.json();
    const liftsRes = await liftsResRaw.json();

    setSubscription(subRes);
    setBookings(Array.isArray(bookRes) ? bookRes : []);
    setMaxLifts(Array.isArray(liftsRes) ? liftsRes : []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");

    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Le password non coincidono");
      return;
    }

    const res = await fetch("/api/auth/login?action=change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.error || "Errore");
      return;
    }

    setPasswordMsg("Password aggiornata! Effettua di nuovo l'accesso.");
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 2000);
  };

  const cancelBooking = async (id) => {
    if (!confirm("Cancellare questa prenotazione?")) return;
    const res = await fetch(`/api/user/bookings?id=${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    loadData();
  };

  const openLiftForm = (exerciseKey) => {
    setSelectedExercise(exerciseKey);
    setLiftForm({ weight: "", reps: "" });
  };

  const saveLift = async () => {
    if (!liftForm.weight || !liftForm.reps) return;
    await fetch("/api/user/bookings?resource=lifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        exercise_key: selectedExercise,
        weight: Number(liftForm.weight),
        reps: Number(liftForm.reps),
      }),
    });
    setSelectedExercise(null);
    loadData();
  };

  const deleteLift = async (id) => {
    if (!confirm("Eliminare questa registrazione?")) return;
    await fetch(`/api/user/bookings?resource=lifts&id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    loadData();
  };

  const getLastLift = (exerciseKey) => {
    return maxLifts.find((l) => l.exercise_key === exerciseKey);
  };

  const getHistoryForExercise = (exerciseKey) => {
    return maxLifts.filter((l) => l.exercise_key === exerciseKey);
  };

  const remaining = subscription
    ? subscription.total_entries - subscription.used_entries
    : 0;
  const isExpired = subscription
    ? new Date(subscription.expires_at) < new Date()
    : false;

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(`${b.date}T${b.time}`) >= now,
  );
  const past = bookings.filter(
    (b) => b.status !== "confirmed" || new Date(`${b.date}T${b.time}`) < now,
  );

  return (
    <div className="personal-page">
      <div className="personal-container">
        <h1>Ciao, {user?.name}</h1>
        <p className="personal-subtitle">La tua area personale</p>

        {loading ? (
          <p className="booking-loading">Caricamento...</p>
        ) : (
          <>
            {!subscription ? (
              <div className="personal-empty">
                Non hai ancora un abbonamento attivo. Contatta lo studio per
                attivarlo.
              </div>
            ) : (
              <div className="membership-card">
                <div className="membership-card-header">
                  <img
                    src="/images/logos/logo.png"
                    alt="FisioFitness"
                    className="membership-logo"
                  />
                </div>
                <div className="membership-card-body">
                  <div className="membership-field">
                    <span className="membership-label">Ingressi rimasti</span>
                    <span className="membership-value">
                      {remaining}{" "}
                      <span className="membership-total">
                        / {subscription.total_entries}
                      </span>
                    </span>
                  </div>
                  <div className="membership-divider"></div>
                  <div className="membership-field">
                    <span className="membership-label">Scadenza</span>
                    <span
                      className={`membership-value ${isExpired ? "personal-expired" : ""}`}
                    >
                      {new Date(subscription.expires_at).toLocaleDateString(
                        "it-IT",
                      )}
                      {isExpired && " (scaduto)"}
                    </span>
                  </div>
                </div>
                <div className="membership-card-footer">
                  <span className="membership-holder">{user?.name}</span>
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h3 style={{ color: "#146272", margin: 0 }}>
                Prossime prenotazioni
              </h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link to="/prenota" className="btn hero-book-btn">
                  <strong>Prenota SALA</strong>
                </Link>
                <Link to="/prenota-corso" className="btn hero-book-btn">
                  <strong>Prenota CORSO</strong>
                </Link>
              </div>
            </div>
            {upcoming.length === 0 ? (
              <p style={{ color: "#666", marginBottom: 32 }}>
                Nessuna prenotazione futura.
              </p>
            ) : (
              <div className="bookings-grid" style={{ marginBottom: 32 }}>
                {upcoming.map((b) => {
                  const { weekday, day, month } = formatBookingDate(b.date);
                  return (
                    <div key={b.id} className="booking-card">
                      <div className="booking-card-date">
                        <span className="booking-card-weekday">{weekday}</span>
                        <span className="booking-card-day">{day}</span>
                        <span className="booking-card-month">{month}</span>
                      </div>
                      <div className="booking-card-time">
                        {b.time.slice(0, 5)}
                      </div>
                      <span
                        className={`user-card-badge ${b.type === "course" ? "badge-teal" : "badge-grey"}`}
                        style={{ fontSize: 12 }}
                      >
                        {b.type === "course" ? "CORSO" : "SALA"}
                      </span>
                      <button
                        className="btn-danger booking-card-cancel"
                        onClick={() => cancelBooking(b.id)}
                      >
                        Cancella
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {past.length > 0 && (
              <>
                <h3 style={{ color: "#146272", marginBottom: 16 }}>Storico</h3>
                <div className="slots-list" style={{ marginBottom: 32 }}>
                  {past.map((b) => (
                    <div key={b.id} className="slot-item inactive">
                      <span>
                        {new Date(b.date + "T00:00:00").toLocaleDateString(
                          "it-IT",
                        )}{" "}
                        alle {b.time.slice(0, 5)}
                      </span>
                      <span className="slot-count">
                        {statusLabels[b.status] || b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 style={{ color: "#146272", marginBottom: 16 }}>
              I tuoi massimali
            </h3>

            <div className="admin-tabs" style={{ flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`tab-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                  type="button"
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="exercises-grid" style={{ marginBottom: 32 }}>
              {EXERCISES.filter((ex) => ex.category === selectedCategory).map(
                (ex) => {
                  const last = getLastLift(ex.key);
                  return (
                    <div
                      key={ex.key}
                      className="exercise-card"
                      onClick={() => openLiftForm(ex.key)}
                    >
                      <img
                        src={ex.image}
                        alt={ex.name}
                        className="exercise-card-img"
                      />
                      <div className="exercise-card-body">
                        <span className="exercise-card-name">{ex.name}</span>
                        {last ? (
                          <span className="exercise-card-best">
                            {last.weight} kg × {last.reps}
                          </span>
                        ) : (
                          <span className="exercise-card-empty">
                            Nessun dato
                          </span>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {selectedExercise && (
              <div
                className="modal-overlay"
                onClick={() => setSelectedExercise(null)}
              >
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                  <h3 style={{ color: "#146272", marginBottom: 16 }}>
                    {EXERCISES.find((e) => e.key === selectedExercise)?.name}
                  </h3>

                  <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <input
                      type="number"
                      placeholder="Kg"
                      value={liftForm.weight}
                      onChange={(e) =>
                        setLiftForm((f) => ({ ...f, weight: e.target.value }))
                      }
                      style={{
                        flex: 1,
                        minWidth: 0,
                        width: "100%",
                        padding: 10,
                        border: "1.5px solid #ddd",
                        borderRadius: 8,
                        boxSizing: "border-box",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Ripetizioni"
                      value={liftForm.reps}
                      onChange={(e) =>
                        setLiftForm((f) => ({ ...f, reps: e.target.value }))
                      }
                      style={{
                        flex: 1,
                        minWidth: 0,
                        width: "100%",
                        padding: 10,
                        border: "1.5px solid #ddd",
                        borderRadius: 8,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                    <button className="btn" onClick={saveLift}>
                      Salva
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => setSelectedExercise(null)}
                    >
                      Chiudi
                    </button>
                  </div>

                  {getHistoryForExercise(selectedExercise).length > 0 && (
                    <>
                      <h4
                        style={{
                          color: "#146272",
                          marginBottom: 12,
                          fontSize: 15,
                        }}
                      >
                        Storico
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          maxHeight: 200,
                          overflowY: "auto",
                        }}
                      >
                        {getHistoryForExercise(selectedExercise).map((l) => (
                          <div key={l.id} className="lift-history-row">
                            <span>
                              {new Date(
                                l.recorded_at + "T00:00:00",
                              ).toLocaleDateString("it-IT")}
                            </span>
                            <span>
                              {l.weight} kg × {l.reps}
                            </span>
                            <button
                              className="lift-delete-btn"
                              onClick={() => deleteLift(l.id)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginBottom: 20 }}>
          <button
            className="btn"
            style={{ padding: "10px 24px", fontSize: 14 }}
            onClick={() => setShowPasswordForm((s) => !s)}
          >
            {showPasswordForm ? "Annulla" : "Cambia password"}
          </button>
        </div>

        {showPasswordForm && (
          <form
            onSubmit={changePassword}
            className="personal-card"
            style={{ background: "white", color: "#333", marginBottom: 24 }}
          >
            <h3 style={{ color: "#146272", marginBottom: 16 }}>
              Cambia password
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                />
                Mostra password
              </label>

              <input
                type={showPasswords ? "text" : "password"}
                placeholder="Password attuale"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, current: e.target.value }))
                }
                required
                style={{
                  padding: 10,
                  border: "1.5px solid #ddd",
                  borderRadius: 8,
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              />
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="Nuova password"
                value={passwordForm.newPass}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, newPass: e.target.value }))
                }
                required
                style={{
                  padding: 10,
                  border: "1.5px solid #ddd",
                  borderRadius: 8,
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              />
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="Conferma nuova password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, confirm: e.target.value }))
                }
                required
                style={{
                  padding: 10,
                  border: "1.5px solid #ddd",
                  borderRadius: 8,
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {passwordError && (
              <p className="form-error" style={{ marginBottom: 12 }}>
                {passwordError}
              </p>
            )}
            {passwordMsg && (
              <p
                style={{ color: "#1e8a4c", marginBottom: 12, fontWeight: 600 }}
              >
                {passwordMsg}
              </p>
            )}

            <button type="submit" className="btn">
              Salva nuova password
            </button>
          </form>
        )}

        <button className="btn-danger" onClick={handleLogout}>
          Esci
        </button>
      </div>
    </div>
  );
}
