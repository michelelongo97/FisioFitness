import { useEffect, useState } from "react";
import { getUser, getToken, logout } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function AreaPersonalePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [subscription, setSubscription] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    const [subRes, bookRes] = await Promise.all([
      fetch("/api/user/subscription", { headers }).then((r) => r.json()),
      fetch("/api/user/bookings", { headers }).then((r) => r.json()),
    ]);

    setSubscription(subRes);
    setBookings(bookRes);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
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
              <div className="personal-card">
                <p>
                  <strong>Ingressi rimasti:</strong> {remaining} /{" "}
                  {subscription.total_entries}
                </p>
                <p>
                  <strong>Scadenza:</strong>{" "}
                  {new Date(subscription.expires_at).toLocaleDateString(
                    "it-IT",
                  )}
                  {isExpired && (
                    <span className="personal-expired"> (scaduto)</span>
                  )}
                </p>
              </div>
            )}

            <h3 style={{ color: "#146272", marginBottom: 16 }}>
              Prossime prenotazioni
            </h3>
            {upcoming.length === 0 ? (
              <p style={{ color: "#666", marginBottom: 32 }}>
                Nessuna prenotazione futura.
              </p>
            ) : (
              <div className="slots-list" style={{ marginBottom: 32 }}>
                {upcoming.map((b) => (
                  <div key={b.id} className="slot-item">
                    <span>
                      {new Date(b.date + "T00:00:00").toLocaleDateString(
                        "it-IT",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        },
                      )}{" "}
                      alle {b.time.slice(0, 5)}
                    </span>
                    <button
                      className="btn-danger"
                      onClick={() => cancelBooking(b.id)}
                    >
                      Cancella
                    </button>
                  </div>
                ))}
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
                      <span className="slot-count">{b.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <button className="btn-danger" onClick={handleLogout}>
          Esci
        </button>
      </div>
    </div>
  );
}
