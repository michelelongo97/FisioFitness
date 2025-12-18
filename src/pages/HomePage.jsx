import HeroCarousel from "../components/HeroCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import {
  faPhone,
  faEnvelope,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <main className="chi-siamo-premium">
        {/* HERO */}
        <section className="chi-hero">
          <div className="chi-hero-content">
            <img
              src="/images/hero/dottore.jpeg"
              loading="lazy"
              alt="Costantino Picciallo"
              className="chi-hero-img"
            />

            <div className="chi-hero-text">
              <h1>Dr. Costantino Picciallo</h1>
              <h2>
                Fisioterapista specializzato <br />& Personal Trainer
                certificato
              </h2>
              <p>
                Riabilitazione muscolo-scheletrica, movimento consapevole e
                performance duratura.
              </p>
            </div>
          </div>
        </section>

        {/* BIO */}
        <section className="chi-section">
          <div className="chi-container">
            <p>
              Mi chiamo <strong>Costantino Picciallo</strong>, ho 28 anni e sono
              un fisioterapista specializzato in{" "}
              <strong>Riabilitazione dei Disordini Muscolo-Scheletrici</strong>.
            </p>

            <p>
              Il mio obiettivo è aiutare le persone a recuperare il benessere
              fisico e migliorare la qualità della vita attraverso terapie
              scientifiche e percorsi personalizzati.
            </p>

            <p>
              Alla mia attività di fisioterapista affianco quella di{" "}
              <strong>Personal Trainer certificato Project Invictus</strong>,
              offrendo un approccio integrato che unisce riabilitazione e
              allenamento per risultati duraturi.
            </p>
          </div>
        </section>

        {/* COMPETENZE */}
        <section className="chi-section chi-dark">
          <div className="chi-container">
            <h3>Competenze Professionali</h3>

            <div className="chi-cards">
              <div className="chi-card">
                <h4>Fisioterapia</h4>
                <p>
                  Valutazione funzionale, riabilitazione muscolo-scheletrica,
                  recupero post-infortunio.
                </p>
              </div>

              <div className="chi-card">
                <h4>Personal Training</h4>
                <p>
                  Allenamento personalizzato, forza, prevenzione infortuni,
                  performance.
                </p>
              </div>

              <div className="chi-card">
                <h4>Approccio Scientifico</h4>
                <p>
                  Metodologie basate su evidenze scientifiche e adattate alla
                  persona.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* METODO */}
        <section className="chi-section">
          <div className="chi-container">
            <h3>Il Metodo</h3>
            <p>
              Credo nel valore di un approccio individualizzato e nel movimento
              come strumento di cura.
            </p>
            <p>
              Ogni percorso nasce da una valutazione accurata e si sviluppa
              combinando riabilitazione e allenamento, con l’obiettivo di
              costruire risultati solidi e sostenibili nel tempo.
            </p>
          </div>
        </section>

        {/* STUDIO */}
        <section className="chi-section chi-light">
          <div className="chi-container">
            <h3>Studio & Palestra</h3>
            <p>
              Lo studio è uno spazio dedicato alla fisioterapia e
              all’allenamento personalizzato, dove il movimento diventa parte
              integrante del percorso di recupero.
            </p>
            <p>
              Un ambiente professionale pensato per offrire continuità tra cura,
              prevenzione e performance fisica.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="chi-cta">
          <h2>Prenota una consulenza</h2>
          <p>
            Contattami direttamente per una valutazione fisioterapica o un
            percorso personalizzato.
          </p>

          <div className="cta-buttons">
            {/* TELEFONO */}
            <a
              href={`tel:${import.meta.env.VITE_PHONE_NUMBER}`}
              className="cta-btn phone"
            >
              <FontAwesomeIcon icon={faPhone} />
              <span>Chiama</span>
            </a>

            {/* WHATSAPP */}
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn whatsapp"
            >
              <FontAwesomeIcon icon={faWhatsapp} />
              <span>WhatsApp</span>
            </a>

            {/* MAPS */}
            <a
              href={`${import.meta.env.VITE_MAPS}`}
              className="cta-btn maps"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faMapLocationDot} />
              <span>Maps</span>
            </a>

            {/* EMAIL */}
            <a
              href={`mailto:${import.meta.env.VITE_EMAIL}`}
              className="cta-btn email"
            >
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Email</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
