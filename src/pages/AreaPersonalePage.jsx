import { useEffect, useState } from "react";
import { getUser, getToken, logout } from "../lib/auth";
import { useNavigate } from "react-router-dom";

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

            <h3 style={{ color: "#146272", marginBottom: 16 }}>
              Prossime prenotazioni
            </h3>
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
          </>
        )}

        <button className="btn-danger" onClick={handleLogout}>
          Esci
        </button>
      </div>
    </div>
  );
}
