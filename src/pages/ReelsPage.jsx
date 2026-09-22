import { useEffect, useState } from "react";

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
            {reels.map((reel, index) => (
              <div key={reel.id} className="reel-card">
                <div className="reel-video-wrapper">
                  <video
                    src={`/videos/reel${index + 1}.mp4`}
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
                {reel.caption && <p className="reel-caption">{reel.caption}</p>}

                <a
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="reel-instagram-link"
                >
                  Vedi su Instagram
                </a>
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
