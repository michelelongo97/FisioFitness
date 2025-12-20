export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="chi-container">
        <h1>Privacy Policy</h1>

        <p>
          La presente informativa è resa ai sensi dell’art. 13 del Regolamento
          UE 2016/679 (GDPR) a coloro che visitano il sito web
          <strong> costafisiofitness.it</strong>.
        </p>

        <h2>Titolare del trattamento</h2>
        <p>
          Il Titolare del trattamento è:
          <br />
          <strong>Dr. Costantino Picciallo</strong>
          <br />
          Fisioterapista
          <br />
          Email: {import.meta.env.VITE_EMAIL}
        </p>

        <h2>Tipologia di dati trattati</h2>
        <p>
          Il sito non raccoglie dati personali tramite form o sistemi di
          registrazione.
        </p>
        <p>
          I dati personali possono essere forniti volontariamente dall’utente
          tramite:
        </p>
        <ul>
          <li>contatto telefonico</li>
          <li>invio di email</li>
          <li>messaggi WhatsApp</li>
        </ul>

        <h2>Finalità del trattamento</h2>
        <p>I dati forniti dall’utente sono utilizzati esclusivamente per:</p>
        <ul>
          <li>rispondere a richieste di informazioni</li>
          <li>fissare appuntamenti o consulenze</li>
          <li>comunicazioni dirette con il professionista</li>
        </ul>

        <h2>Base giuridica del trattamento</h2>
        <p>
          Il trattamento dei dati si basa sul consenso espresso dell’utente
          tramite contatto diretto.
        </p>

        <h2>Modalità di trattamento</h2>
        <p>
          I dati sono trattati con strumenti informatici e telematici nel
          rispetto delle misure di sicurezza previste dalla normativa vigente.
        </p>

        <h2>Conservazione dei dati</h2>
        <p>
          I dati vengono conservati per il tempo necessario a soddisfare la
          richiesta dell’utente e non vengono ceduti a terzi.
        </p>

        <h2>Diritti dell’utente</h2>
        <p>L’utente ha il diritto di:</p>
        <ul>
          <li>accedere ai propri dati</li>
          <li>chiederne la rettifica o cancellazione</li>
          <li>limitare o opporsi al trattamento</li>
        </ul>

        <p>
          Le richieste possono essere inviate all’indirizzo email indicato
          sopra.
        </p>

        <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
