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
    <div className="personal-page">
      <div className="personal-container">
        <h1>Ciao, {user?.name}</h1>
        <p className="personal-subtitle">La tua area personale</p>

        {loading ? (
          <p className="booking-loading">Caricamento...</p>
        ) : !subscription ? (
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
              {new Date(subscription.expires_at).toLocaleDateString("it-IT")}
              {isExpired && (
                <span className="personal-expired"> (scaduto)</span>
              )}
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
