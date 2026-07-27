import { useEffect, useState } from "react";
import { getToken } from "../lib/auth";

export default function BookingPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null); // slot in corso di conferma
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" | "error"

  const loadSlots = () => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((data) => {
        setSlots(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const slotsByDate = slots.reduce((acc, slot) => {
    const d = slot.date.slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(slot);
    return acc;
  }, {});

  const confirmBooking = async () => {
    setMsg("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ slotId: booking.id }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || "Errore nella prenotazione");
      setMsgType("error");
      return;
    }

    setMsg("Prenotazione confermata! La trovi nella tua area personale.");
    setMsgType("success");
    setBooking(null);
    loadSlots();
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h1>Prenota uno slot</h1>
        <p className="booking-subtitle">Scegli data e orario disponibile</p>

        {msg && (
          <div
            className={msgType === "success" ? "personal-card" : "form-error"}
            style={{ marginBottom: 24 }}
          >
            {msg}
          </div>
        )}

        {loading ? (
          <p className="booking-loading">Caricamento...</p>
        ) : Object.keys(slotsByDate).length === 0 ? (
          <p className="booking-empty">
            Nessuno slot disponibile al momento. Contattami su WhatsApp.
          </p>
        ) : (
          <div className="slot-picker">
            {Object.entries(slotsByDate).map(([date, daySlots]) => (
              <div key={date} className="slot-day">
                <h3 className="slot-date">
                  {new Date(date + "T00:00:00").toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <div className="slot-times">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      className="slot-btn"
                      onClick={() => setBooking(slot)}
                    >
                      {slot.time.slice(0, 5)}
                      <span
                        style={{
                          fontSize: 11,
                          display: "block",
                          fontWeight: "normal",
                        }}
                      >
                        {slot.max_bookings - slot.booked_count} posti
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE CONFERMA */}
      {booking && (
        <div className="admin-login" onClick={() => setBooking(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              padding: 32,
              borderRadius: 16,
              minWidth: 300,
            }}
          >
            <h3 style={{ color: "#146272", marginBottom: 16 }}>
              Confermi la prenotazione?
            </h3>
            <p style={{ marginBottom: 24 }}>
              {new Date(booking.date + "T00:00:00").toLocaleDateString(
                "it-IT",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                },
              )}{" "}
              alle {booking.time.slice(0, 5)}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn" onClick={confirmBooking}>
                Conferma
              </button>
              <button className="btn-danger" onClick={() => setBooking(null)}>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
