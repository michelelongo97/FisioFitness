import HeroCarousel from "../components/HeroCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import {
  faPhone,
  faEnvelope,
  faMapLocationDot,
  faGraduationCap,
  faDumbbell,
  faUserDoctor,
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

              <h2>Fisioterapista & Personal Trainer</h2>

              <ul className="chi-titles">
                <li>
                  <FontAwesomeIcon icon={faGraduationCap} />
                  Laurea in Fisioterapia
                </li>
                <li>
                  <FontAwesomeIcon icon={faUserDoctor} />
                  Master in Riabilitazione dei Disordini Muscolo-Scheletrici
                </li>
                <li>
                  <FontAwesomeIcon icon={faDumbbell} />
                  Personal Trainer Certificato Project Invictus
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* BIO */}
        <section className="chi-section">
          <div className="chi-container">
            <h3>Chi Sono</h3>

            <p>
              Mi chiamo <strong>Costantino Picciallo</strong>, ho 28 anni e sono
              un fisioterapista specializzato in{" "}
              <strong>Riabilitazione dei Disordini Muscolo-Scheletrici</strong>.
            </p>

            <p>
              Il mio obiettivo è aiutare le persone a recuperare il benessere
              fisico e migliorare la qualità della vita attraverso percorsi
              terapeutici basati su evidenze scientifiche.
            </p>

            <p>
              Affianco all’attività clinica quella di{" "}
              <strong>Personal Trainer certificato Project Invictus</strong>,
              per offrire un approccio completo che unisca riabilitazione e
              allenamento.
            </p>
          </div>
        </section>

        {/* COMPETENZE */}
        <section className="chi-section chi-dark">
          <div className="chi-container">
            <h3>Servizi</h3>

            <div className="chi-services">
              <div className="chi-service">
                <h4>Terapia Manuale</h4>
                <p>
                  Trattamenti mirati per ridurre il dolore e migliorare la
                  mobilità articolare.
                </p>
              </div>

              <div className="chi-service">
                <h4>Esercizio Terapeutico</h4>
                <p>
                  Programmi di esercizio personalizzati per il recupero
                  funzionale.
                </p>
              </div>

              <div className="chi-service">
                <h4>Riabilitazione Ortopedica</h4>
                <p>Percorsi post-infortunio e post-chirurgici su misura.</p>
              </div>

              <div className="chi-service">
                <h4>Riabilitazione Neurologica</h4>
                <p>
                  Recupero motorio e funzionale con approccio individualizzato.
                </p>
              </div>

              <div className="chi-service">
                <h4>Allenamento Personalizzato</h4>
                <p>Integrazione tra riabilitazione e performance fisica.</p>
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
