import { useEffect, useState } from "react";
import { getUser, getToken, logout } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function AreaPersonalePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/subscription", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSubscription(data);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const remaining = subscription
    ? subscription.total_entries - subscription.used_entries
    : 0;
  const isExpired = subscription
    ? new Date(subscription.expires_at) < new Date()
    : false;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h1>Ciao, {user?.name}</h1>
        <p className="booking-subtitle">La tua area personale</p>

        {loading ? (
          <p className="booking-loading">Caricamento...</p>
        ) : !subscription ? (
          <div className="booking-recap">
            Non hai ancora un abbonamento attivo. Contatta lo studio per
            attivarlo.
          </div>
        ) : (
          <div className="booking-recap" style={{ marginBottom: 32 }}>
            <p>
              <strong>Ingressi rimasti:</strong> {remaining} /{" "}
              {subscription.total_entries}
            </p>
            <p>
              <strong>Scadenza:</strong>{" "}
              {new Date(subscription.expires_at).toLocaleDateString("it-IT")}
              {isExpired && <span style={{ color: "#c00" }}> (scaduto)</span>}
            </p>
          </div>
        )}

        <button className="btn-danger" onClick={handleLogout}>
          Esci
        </button>
      </div>
    </div>
  );
}
