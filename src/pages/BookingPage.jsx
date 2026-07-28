import { useEffect, useState } from "react";
import { getToken } from "../lib/auth";

export default function BookingPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [booking, setBooking] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const loadSlots = () => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then((data) => {
        setSlots(data);
        setLoading(false);
        if (data.length > 0 && !selectedDate) {
          setSelectedDate(data[0].date.slice(0, 10));
        }
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

  const sortedDates = Object.keys(slotsByDate).sort();

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
      setTimeout(() => setMsg(""), 4000);
      return;
    }

    setMsg("Prenotazione confermata! La trovi nella tua area personale.");
    setMsgType("success");
    setBooking(null);
    loadSlots();
    setTimeout(() => setMsg(""), 4000);
  };

  const dayLabel = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      weekday: d
        .toLocaleDateString("it-IT", { weekday: "short" })
        .toUpperCase(),
      day: d.getDate(),
    };
  };

  const monthLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
      })
    : "";

  const currentSlots = selectedDate ? slotsByDate[selectedDate] || [] : [];

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h1>Prenota uno slot</h1>
        <p className="booking-subtitle">Scegli data e orario disponibile</p>

        {loading ? (
          <p className="booking-loading">Caricamento...</p>
        ) : sortedDates.length === 0 ? (
          <p className="booking-empty">
            Nessuno slot disponibile al momento. Contattami su WhatsApp.
          </p>
        ) : (
          <div className="sm-scheduler">
            <div className="sm-month-nav">
              <span className="sm-month-label">
                {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
              </span>
            </div>

            <div className="sm-day-tabs">
              {sortedDates.map((date) => {
                const { weekday, day } = dayLabel(date);
                const isActive = date === selectedDate;
                return (
                  <button
                    key={date}
                    className={`sm-day-tab ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedDate(date)}
                    type="button"
                  >
                    <span className="sm-day-weekday">{weekday}</span>
                    <span className="sm-day-number">{day}</span>
                  </button>
                );
              })}
            </div>

            <div className="sm-duration">
              Durata seduta: <strong>45 min</strong>
            </div>

            <div className="sm-slot-list">
              {currentSlots.map((slot) => (
                <button
                  key={slot.id}
                  className="sm-slot-row"
                  onClick={() => setBooking(slot)}
                  type="button"
                >
                  <span className="sm-slot-time">{slot.time.slice(0, 5)}</span>
                  <span className="sm-slot-badge">
                    {slot.max_bookings - slot.booked_count} /{" "}
                    {slot.max_bookings}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALE CONFERMA */}
      {booking && (
        <div className="modal-overlay" onClick={() => setBooking(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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

      {/* TOAST */}
      {msg && <div className={`toast toast-${msgType}`}>{msg}</div>}
    </div>
  );
}
