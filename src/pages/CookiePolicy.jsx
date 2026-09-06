export default function CookiePolicy() {
  return (
    <main className="legal-page">
      <div className="chi-container">
        <h1>Cookie Policy</h1>
        <p>
          Il sito <strong>costafisiofitness.it</strong> utilizza cookie tecnici
          necessari al corretto funzionamento del sito e, solo previo consenso,
          contenuti di terze parti che possono impostare propri cookie.
        </p>
        <h2>Cosa sono i cookie</h2>
        <p>
          I cookie sono piccoli file di testo che i siti visitati inviano al
          dispositivo dell'utente, dove vengono memorizzati per essere poi
          ritrasmessi agli stessi siti alla visita successiva.
        </p>
        <h2>Tipologie di cookie utilizzati</h2>
        <p>Questo sito utilizza:</p>
        <ul>
          <li>cookie tecnici di navigazione</li>
          <li>
            un token di autenticazione salvato localmente nel browser (non un
            cookie in senso stretto, ma un dato equivalente), necessario per
            mantenere l'accesso all'area personale degli utenti registrati
          </li>
          <li>
            una preferenza salvata localmente nel browser per ricordare la
            scelta espressa riguardo ai cookie di terze parti (accettati o
            rifiutati)
          </li>
        </ul>
        <h2>Cookie di terze parti</h2>
        <p>
          Nella pagina "Video" il sito può incorporare contenuti (reel) ospitati
          su Instagram tramite iframe. Questi contenuti vengono caricati solo se
          l'utente ha espresso consenso tramite il banner cookie o l'apposito
          pulsante "Carica il video" presente su ogni contenuto. Una volta
          caricati, possono impostare autonomamente cookie di terze parti
          riconducibili a Meta/Instagram, secondo la loro informativa, non
          controllata dal Titolare di questo sito. Si consiglia di consultare la{" "}
          <a
            href="https://privacycenter.instagram.com/policy/cookies/"
            target="_blank"
            rel="noopener noreferrer"
          >
            cookie policy di Instagram
          </a>{" "}
          per maggiori informazioni.
        </p>
        <h2>Consenso all'uso dei cookie</h2>
        <p>
          I cookie tecnici e il token di autenticazione non richiedono consenso,
          in quanto strettamente necessari al funzionamento del sito e dell'area
          personale. I cookie di terze parti (Instagram) vengono impostati solo
          dopo consenso esplicito dell'utente, raccolto tramite il banner
          mostrato alla prima visita o, per il singolo contenuto, tramite il
          pulsante di caricamento presente nella pagina "Video".
        </p>
        <h2>Gestione e revoca del consenso</h2>
        <p>
          L'utente può modificare in qualsiasi momento la scelta precedentemente
          espressa cliccando su "Gestisci cookie" nel footer del sito, che
          riapre il banner di consenso. È inoltre possibile gestire o
          disabilitare i cookie direttamente dalle impostazioni del proprio
          browser. Disabilitare il token di autenticazione richiederà di
          effettuare nuovamente l'accesso ad ogni visita.
        </p>
        <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
      </div>
    </main>
  );
}
