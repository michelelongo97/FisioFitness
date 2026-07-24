import { useEffect, useState } from "react";

function toEmbedUrl(url) {
  return url.replace(/\/(reel|p)\/([^/]+)\/.*/, "/p/$2/embed");
}

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reels")
      .then((r) => r.json())
      .then((data) => {
        setReels(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="reels-page">
      <div className="reels-container">
        <h1>Video & Reel</h1>
        <p className="reels-subtitle">
          Seguimi su Instagram per contenuti su fisioterapia e allenamento
        </p>

        {loading ? (
          <p className="reels-loading">Caricamento...</p>
        ) : reels.length === 0 ? (
          <p className="reels-empty">Nessun video disponibile al momento.</p>
        ) : (
          <div className="reels-grid">
            {reels.map((reel) => (
              <div key={reel.id} className="reel-card">
                <div className="reel-embed-wrapper">
                  <iframe
                    src={toEmbedUrl(reel.url)}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    loading="lazy"
                    title={reel.caption || `Reel ${reel.id}`}
                  />
                </div>
                {reel.caption && <p className="reel-caption">{reel.caption}</p>}
              </div>
            ))}
          </div>
        )}

        <a
          href={import.meta.env.VITE_SOCIAL_INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="btn reels-cta"
        >
          Seguimi su Instagram
        </a>
      </div>
    </div>
  );
}
