import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      <img src="/images/logos/notfound.jpeg" alt="Pagina non trovata" />
      <h1>Pagina non trovata</h1>
      <button className="btn" onClick={() => navigate("/")}>
        Torna in Home
      </button>
    </div>
  );
}
