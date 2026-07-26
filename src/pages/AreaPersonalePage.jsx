import { getUser, logout } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function AreaPersonalePage() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <h1>Ciao, {user?.name}</h1>
        <p className="booking-subtitle">La tua area personale</p>

        <button className="btn-danger" onClick={handleLogout}>
          Esci
        </button>
      </div>
    </div>
  );
}
