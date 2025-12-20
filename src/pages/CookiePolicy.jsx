export default function CookiePolicy() {
  return (
    <main className="legal-page">
      <div className="chi-container">
        <h1>Cookie Policy</h1>

        <p>
          Il sito <strong>costafisiofitness.it</strong> utilizza esclusivamente
          cookie tecnici necessari al corretto funzionamento del sito.
        </p>

        <h2>Cosa sono i cookie</h2>
        <p>
          I cookie sono piccoli file di testo che i siti visitati inviano al
          dispositivo dell’utente, dove vengono memorizzati per essere poi
          ritrasmessi agli stessi siti alla visita successiva.
        </p>

        <h2>Tipologie di cookie utilizzati</h2>
        <p>Questo sito utilizza:</p>
        <ul>
          <li>cookie tecnici di navigazione</li>
          <li>cookie necessari al funzionamento del sito</li>
        </ul>

        <p>
          Non vengono utilizzati cookie di profilazione, cookie di terze parti,
          sistemi di tracciamento o strumenti di analisi statistica.
        </p>

        <h2>Consenso all’uso dei cookie</h2>
        <p>
          Poiché il sito utilizza esclusivamente cookie tecnici, non è richiesto
          il consenso dell’utente.
        </p>

        <h2>Gestione dei cookie</h2>
        <p>
          L’utente può comunque gestire o disabilitare i cookie direttamente
          dalle impostazioni del proprio browser.
        </p>

        <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
