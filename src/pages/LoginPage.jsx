import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Errore nel login");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/area-personale");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img
          src="/images/logos/logo.png"
          alt="FisioFitness"
          className="login-logo"
        />
        <h2>Bentornato</h2>
        <p className="login-subtitle">Accedi alla tua area personale</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingRight: 44,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#146272",
                fontWeight: 600,
              }}
            >
              {showPassword ? "Nascondi" : "Mostra"}
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn hero-book-btn login-btn"
            disabled={loading}
          >
            <strong>{loading ? "Accesso in corso..." : "Accedi"}</strong>
          </button>
        </form>
      </div>
    </div>
  );
}
